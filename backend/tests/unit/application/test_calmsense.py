"""CalmSense as a use case: the prompt it builds, how it reads the reply, and its safety checks."""

import pytest

from app.application.agents.calmsense import DecomposeTask
from app.application.errors import AgentReplyError, UnsafeContentError, UnsafeOutputError
from app.application.prompts import TASK_DECOMPOSITION_PROMPT
from app.application.safety import SafetyGate
from app.domain.tasks import Step, TaskBreakdown
from app.infrastructure.llm.fake import FakeLLM
from app.infrastructure.pii.regex_redactor import RegexPIIRedactor
from tests.fakes import ScriptedSafety

REPLY = {
    "subtasks": [{"title": "Open the file", "timeEstimate": "~5 min"}, {"title": "Write one line"}],
    "whyExplanation": "Smallest step first.",
}


@pytest.fixture
def llm():
    return FakeLLM()


@pytest.fixture
def safety():
    return ScriptedSafety()


@pytest.fixture
def calmsense(llm, safety):
    return DecomposeTask(llm, SafetyGate(safety, RegexPIIRedactor()))


async def test_builds_the_request_and_reads_the_steps(calmsense, llm):
    llm.script("decompose", REPLY)

    breakdown = await calmsense.run("Write essay", "small", "evening")

    assert breakdown == TaskBreakdown(
        steps=(Step("Open the file", "~5 min"), Step("Write one line", "")), why="Smallest step first."
    )
    [call] = llm.calls
    assert call.system_prompt == TASK_DECOMPOSITION_PROMPT
    assert call.user_message == (
        "Task: Write essay\nUser's preferred chunk size: small\nCurrent time of day: evening\n\n"
        "Break this task into achievable subtasks."
    )
    assert (call.temperature, call.max_tokens, call.json_mode) == (0.7, 1024, True)


async def test_direct_call_screens_and_redacts_the_input(calmsense, llm, safety):
    llm.script("decompose", REPLY)

    await calmsense("Email sam@example.com")

    assert safety.shielded == ["Email sam@example.com"]
    assert "sam@example.com" not in llm.sent_text()


async def test_direct_call_rejects_unsafe_input(calmsense, llm, safety):
    safety.flag("hurt")

    with pytest.raises(UnsafeContentError):
        await calmsense("hurt")

    assert llm.calls == []


async def test_output_is_checked_once_and_redacted(calmsense, llm, safety):
    llm.script("decompose", {**REPLY, "whyExplanation": "Mail sam@example.com first."})

    breakdown = await calmsense.run("Essay", "medium", "day")

    assert safety.analyzed == ["Open the file\nWrite one line\nMail sam@example.com first."]
    assert breakdown.why == "Mail [REDACTED] first."


async def test_unsafe_output_raises(calmsense, llm, safety):
    llm.script("decompose", REPLY)
    safety.flag("Write one line")

    with pytest.raises(UnsafeOutputError):
        await calmsense.run("Essay", "medium", "day")


@pytest.mark.parametrize(
    "reply",
    ["not json", {"subtasks": "none"}, {"subtasks": [{"timeEstimate": "~5 min"}]}, {"subtasks": ["a step"]}],
    ids=["prose", "not-a-list", "no-title", "not-objects"],
)
async def test_unusable_reply_is_an_agent_reply_error(calmsense, llm, reply):
    llm.script("decompose", reply)

    with pytest.raises(AgentReplyError):
        await calmsense.run("Essay", "medium", "day")


async def test_missing_fields_are_empty(calmsense, llm):
    llm.script("decompose", {})

    assert await calmsense.run("Essay", "medium", "day") == TaskBreakdown(steps=(), why="")
