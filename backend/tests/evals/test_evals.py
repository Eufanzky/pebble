"""Real-LLM evals for the chat pipeline (roadmap 2.8). Opt-in: ``uv run pytest -m eval``.

Every labelled message in ``cases.py`` goes through the real ``HandleChat`` use case with
the configured provider (``LLM_PROVIDER``, ``LLM_API_KEY``, ...). Four scores are checked
against targets:

- JSON validity: the classifier returns a JSON object with a known intent and a response.
- Intent accuracy: the classifier picks the labelled intent.
- Distress recall: every distress message is recognised as distress.
- Voice rules: every reply Pebble shows follows the voice rules (``voice.py``).

A report is written to ``tests/evals/results/latest.json``. Record baselines in the README.
"""

import asyncio
import json
import os
import time
from dataclasses import dataclass, field
from pathlib import Path

import pytest

from app.api.dependencies import Container
from app.application.errors import AgentReplyError
from app.application.llm_json import parse_json_object
from app.application.ports.llm import LLMProvider, LLMRateLimitedError, LLMRequest
from app.domain.agents import Intent
from app.domain.chat import ChatContext, Encouragement
from app.domain.documents import Simplification
from app.domain.tasks import TaskBreakdown
from app.infrastructure.config import Settings
from app.infrastructure.llm.factory import UnconfiguredLLM
from tests.evals.cases import CASES, Case
from tests.evals.voice import voice_problems

pytestmark = pytest.mark.eval

TARGETS = {"json_validity": 1.0, "intent_accuracy": 0.8, "distress_recall": 1.0, "voice_rules": 0.9}
REPORT = Path(__file__).parent / "results" / "latest.json"
# Keeps a run inside free-tier per-minute limits (Groq: 30 requests and 8K tokens a minute).
REQUEST_INTERVAL = float(os.environ.get("EVAL_REQUEST_INTERVAL", "6.5"))
MAX_RATE_LIMIT_RETRIES = 3


class PacedLLM:
    """Wraps the real provider: spaces requests out, waits out 429s, and keeps every raw reply."""

    def __init__(self, llm: LLMProvider, interval: float) -> None:
        self.llm = llm
        self.interval = interval
        self.replies: list[tuple[LLMRequest, str]] = []
        self._last = 0.0

    async def complete(self, request: LLMRequest) -> str:
        for attempt in range(MAX_RATE_LIMIT_RETRIES + 1):
            await asyncio.sleep(max(0.0, self._last + self.interval - time.monotonic()))
            self._last = time.monotonic()
            try:
                reply = await self.llm.complete(request)
                break
            except LLMRateLimitedError as e:
                if attempt == MAX_RATE_LIMIT_RETRIES:
                    raise
                await asyncio.sleep(min(e.retry_after or 30.0, 90.0))
        self.replies.append((request, reply))
        return reply


@dataclass
class CaseResult:
    case: Case
    classifier_json_ok: bool = False
    classified_intent: str | None = None
    shown_texts: list[str] = field(default_factory=list)
    voice_problems: list[str] = field(default_factory=list)
    error: str | None = None


def shown_texts(reply) -> list[str]:
    """Everything from this turn that the user reads."""
    texts = [reply.response]
    data = reply.data
    if isinstance(data, TaskBreakdown):
        texts += [step.title for step in data.steps] + [data.why]
    elif isinstance(data, Simplification):
        texts += [data.simplified, data.why]
    elif isinstance(data, Encouragement):
        texts.append(data.message)
    return [t for t in texts if t]


def classifier_json_ok(raw: str) -> tuple[bool, str | None]:
    try:
        reply = parse_json_object(raw)
    except AgentReplyError:
        return False, None
    intent = reply.get("intent")
    known = intent in {i.value for i in Intent}
    return known and isinstance(reply.get("response"), str), intent if known else None


async def run_case(container: Container, llm: PacedLLM, case: Case) -> CaseResult:
    result = CaseResult(case)
    start = len(llm.replies)
    try:
        reply = await container.handle_chat(case.message, ChatContext(**case.context))
    except Exception as e:  # an eval records failures instead of stopping
        result.error = f"{type(e).__name__}: {e}"
        return result
    classifier = [raw for request, raw in llm.replies[start:] if request.agent == "orchestrator"]
    if classifier:
        result.classifier_json_ok, result.classified_intent = classifier_json_ok(classifier[0])
    result.shown_texts = shown_texts(reply)
    result.voice_problems = [p for text in result.shown_texts for p in voice_problems(text)]
    return result


async def run_all(settings: Settings) -> tuple[list[CaseResult], dict]:
    container = Container.from_settings(settings)
    interval = 0.0 if settings.llm_provider == "fake" else REQUEST_INTERVAL
    llm = PacedLLM(container.llm, interval)
    container.llm = llm
    try:
        results = [await run_case(container, llm, case) for case in CASES]
    finally:
        await container.aclose()
    return results, {"provider": settings.llm_provider, "model": settings.llm_model or "(provider default)",
                     "llm_calls": len(llm.replies)}


def scores(results: list[CaseResult]) -> dict[str, float]:
    distress = [r for r in results if r.case.intent == "distress"]
    return {
        "json_validity": sum(r.classifier_json_ok for r in results) / len(results),
        "intent_accuracy": sum(r.classified_intent == r.case.intent for r in results) / len(results),
        "distress_recall": sum(r.classified_intent == "distress" for r in distress) / len(distress),
        "voice_rules": sum(not r.voice_problems and not r.error for r in results) / len(results),
    }


@pytest.fixture(scope="module")
def evaluation() -> dict:
    settings = Settings()
    if isinstance(Container.from_settings(settings).llm, UnconfiguredLLM):
        pytest.skip("No LLM configured: set LLM_API_KEY (or LLM_PROVIDER=fake to check the harness)")
    results, run = asyncio.run(run_all(settings))
    report = {
        **run,
        "scores": scores(results),
        "targets": TARGETS,
        "cases": [
            {
                "id": r.case.id,
                "expected": r.case.intent,
                "classified": r.classified_intent,
                "json_ok": r.classifier_json_ok,
                "voice_problems": r.voice_problems,
                "error": r.error,
                "shown": r.shown_texts,
            }
            for r in results
        ],
    }
    REPORT.parent.mkdir(exist_ok=True)
    REPORT.write_text(json.dumps(report, indent=2, ensure_ascii=False))
    print("\nEval scores:", json.dumps(report["scores"]), "calls:", run["llm_calls"])
    return report


def misses(report: dict, predicate) -> list[str]:
    return [
        f"{c['id']}: expected {c['expected']}, classified {c['classified']}; voice {c['voice_problems']}; "
        f"shown {c['shown']}"
        for c in report["cases"]
        if predicate(c)
    ]


def test_no_case_errored(evaluation):
    assert [c for c in evaluation["cases"] if c["error"]] == []


def test_classifier_returns_valid_json(evaluation):
    assert evaluation["scores"]["json_validity"] >= TARGETS["json_validity"], misses(
        evaluation, lambda c: not c["json_ok"]
    )


def test_intent_accuracy(evaluation):
    assert evaluation["scores"]["intent_accuracy"] >= TARGETS["intent_accuracy"], misses(
        evaluation, lambda c: c["classified"] != c["expected"]
    )


def test_every_distress_message_is_caught(evaluation):
    assert evaluation["scores"]["distress_recall"] >= TARGETS["distress_recall"], misses(
        evaluation, lambda c: c["expected"] == "distress" and c["classified"] != "distress"
    )


def test_replies_follow_the_voice_rules(evaluation):
    assert evaluation["scores"]["voice_rules"] >= TARGETS["voice_rules"], misses(
        evaluation, lambda c: c["voice_problems"]
    )
