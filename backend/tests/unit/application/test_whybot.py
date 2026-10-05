"""WhyBot as a use case: what it's asked, what it answers, and that it never costs the user an answer (7.4)."""

import pytest

from app.application.agents.whybot import MAX_WHY, Explain, explain
from app.application.ports.llm import LLMRateLimitedError, LLMUnavailableError
from app.application.prompts import WHYBOT_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import AgentName
from app.infrastructure.llm.fake import FakeLLM
from app.infrastructure.pii.regex_redactor import RegexPIIRedactor
from tests.fakes import ScriptedSafety

ARGS = (AgentName.CALM_SENSE, '"Write the essay"', "Split it into 2 steps", "step size small", "Its own reason.")


@pytest.fixture
def llm():
    return FakeLLM()


@pytest.fixture
def safety():
    return ScriptedSafety()


@pytest.fixture
def whybot(llm, safety):
    return Explain(llm, SafetyGate(safety, RegexPIIRedactor()))


async def test_asks_with_the_agent_the_question_the_result_and_the_settings(whybot, llm):
    llm.script("WhyBot", {"why": "  Your step size is small, so each step is short.  "})

    why = await whybot(*ARGS)

    assert why == "Your step size is small, so each step is short."
    [call] = llm.calls
    assert (call.agent, call.system_prompt, call.json_mode) == ("WhyBot", WHYBOT_PROMPT, True)
    assert call.user_message == (
        'Agent: CalmSense\nAsked: "Write the essay"\nWhat it did: Split it into 2 steps\nSettings: step size small'
    )


async def test_its_answer_is_checked_and_redacted(whybot, llm, safety):
    llm.script("WhyBot", {"why": "Because you mailed sam@example.com."})

    why = await whybot(*ARGS)

    assert "sam@example.com" not in why
    assert safety.analyzed == ["Because you mailed sam@example.com."]


async def test_a_long_answer_is_cut(whybot, llm):
    llm.script("WhyBot", {"why": "word " * 200})

    assert len(await whybot(*ARGS)) <= MAX_WHY


@pytest.mark.parametrize(
    "reply",
    [LLMUnavailableError("down"), LLMRateLimitedError(retry_after=30), "not json", {"why": ""}, {"answer": "x"}],
    ids=["outage", "rate-limited", "not-json", "empty", "no-why"],
)
async def test_falls_back_to_the_agents_own_reasoning_when_it_cant_answer(whybot, llm, reply):
    llm.script("WhyBot", reply)

    assert await whybot(*ARGS) == "Its own reason."


async def test_a_flagged_answer_falls_back_too(whybot, llm, safety):
    llm.script("WhyBot", {"why": "Something harmful."})
    safety.flag("Something harmful.")

    assert await whybot(*ARGS) == "Its own reason."


async def test_without_whybot_the_agents_reasoning_is_the_explanation():
    assert await explain(None, *ARGS) == "Its own reason."
