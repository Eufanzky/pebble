"""Real-LLM evals for WhyBot (7.9). Opt-in: ``uv run pytest -m eval``.

Every case in ``whybot_cases.py`` goes through the real ``Explain`` use case. Four scores:

- Answered: WhyBot gave its own explanation (not the agent's reasoning as a fallback).
- Voice rules: it follows the voice rules (``voice.py``).
- Names the setting: it mentions the setting that mattered, so the user knows what to change.
- No invented numbers: every number in it was in what WhyBot was given.

A report is written to ``tests/evals/results/whybot.json``. Record baselines in the README.
"""

import asyncio
import json
import re
from pathlib import Path

import pytest

from app.api.dependencies import Container
from app.domain.agents import AgentName
from app.infrastructure.config import Settings
from app.infrastructure.llm.factory import UnconfiguredLLM
from tests.evals.test_evals import REQUEST_INTERVAL, PacedLLM
from tests.evals.voice import voice_problems
from tests.evals.whybot_cases import WHY_CASES, WhyCase

pytestmark = pytest.mark.eval

TARGETS = {"answered": 1.0, "voice_rules": 0.9, "names_the_setting": 0.8, "no_invented_numbers": 1.0}
REPORT = Path(__file__).parent / "results" / "whybot.json"
FALLBACK = "\u0000fallback"


def numbers(text: str) -> set[str]:
    return set(re.findall(r"\d+", text))


def judge(case: WhyCase, why: str) -> dict:
    answered = why != FALLBACK
    given = numbers(" ".join((case.asked, case.did, case.settings)))
    lowered = why.lower()
    return {
        "id": case.id,
        "why": why if answered else None,
        "answered": answered,
        "voice_problems": voice_problems(why) if answered else [],
        "names_the_setting": answered and any(word.lower() in lowered for word in case.names),
        "invented_numbers": sorted(numbers(why) - given) if answered else [],
    }


async def run_all(settings: Settings) -> tuple[list[dict], dict] | None:
    container = Container.from_settings(settings)
    if isinstance(container.llm, UnconfiguredLLM):
        await container.aclose()
        return None
    llm = PacedLLM(container.llm, 0.0 if settings.llm_provider == "fake" else REQUEST_INTERVAL)
    container.llm = llm
    try:
        whybot = container.whybot
        results = [
            judge(case, await whybot(AgentName(case.agent), case.asked, case.did, case.settings, FALLBACK))
            for case in WHY_CASES
        ]
    finally:
        await container.aclose()
    return results, {"provider": settings.llm_provider, "model": settings.llm_model or "(provider default)"}


def scores(results: list[dict]) -> dict[str, float]:
    n = len(results)
    return {
        "answered": sum(r["answered"] for r in results) / n,
        "voice_rules": sum(r["answered"] and not r["voice_problems"] for r in results) / n,
        "names_the_setting": sum(r["names_the_setting"] for r in results) / n,
        "no_invented_numbers": sum(not r["invented_numbers"] for r in results) / n,
    }


@pytest.fixture(scope="module")
def evaluation() -> dict:
    outcome = asyncio.run(run_all(Settings()))
    if outcome is None:
        pytest.skip("No LLM configured: set LLM_API_KEY (or LLM_PROVIDER=fake to check the harness)")
    results, run = outcome
    report = {**run, "scores": scores(results), "targets": TARGETS, "cases": results}
    REPORT.parent.mkdir(exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print("\nWhyBot scores:", json.dumps(report["scores"]))
    return report


def test_whybot_answers_every_case(evaluation):
    assert evaluation["scores"]["answered"] >= TARGETS["answered"], [
        c for c in evaluation["cases"] if not c["answered"]
    ]


def test_explanations_follow_the_voice_rules(evaluation):
    assert evaluation["scores"]["voice_rules"] >= TARGETS["voice_rules"], [
        c for c in evaluation["cases"] if c["voice_problems"]
    ]


def test_explanations_name_the_setting_that_mattered(evaluation):
    assert evaluation["scores"]["names_the_setting"] >= TARGETS["names_the_setting"], [
        c for c in evaluation["cases"] if not c["names_the_setting"]
    ]


def test_explanations_invent_no_numbers(evaluation):
    assert evaluation["scores"]["no_invented_numbers"] >= TARGETS["no_invented_numbers"], [
        c for c in evaluation["cases"] if c["invented_numbers"]
    ]
