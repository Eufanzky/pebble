"""PebbleVoice as a use case: specific encouragement from real progress, checked and redacted."""

import pytest

from app.application.agents.pebblevoice import Encourage
from app.application.errors import AgentReplyError, UnsafeOutputError
from app.application.prompts import PEBBLEVOICE_PROMPT
from app.application.safety import SafetyGate
from app.domain.agents import Mood
from app.domain.chat import ChatContext, Encouragement
from app.infrastructure.llm.fake import FakeLLM
from app.infrastructure.pii.regex_redactor import RegexPIIRedactor
from tests.fakes import ScriptedSafety


@pytest.fixture
def llm():
    return FakeLLM()


@pytest.fixture
def safety():
    return ScriptedSafety()


@pytest.fixture
def encourage(llm, safety):
    return Encourage(llm, SafetyGate(safety, RegexPIIRedactor()))


async def test_builds_the_request_from_the_progress(encourage, llm):
    llm.script("PebbleVoice", {"message": "You finished 2 things today.", "mood": "happy"})

    result = await encourage(
        ChatContext(tasks_completed=2, tasks_total=5, recent_task_titles=("Laundry", "Email"), time_of_day="evening")
    )

    assert result == Encouragement("You finished 2 things today.", Mood.HAPPY)
    [call] = llm.calls
    assert call.system_prompt == PEBBLEVOICE_PROMPT
    assert call.user_message == (
        "Tasks completed today: 2/5\nTime of day: evening\nPebble personality: gentle\n"
        "Recently completed: Laundry, Email\n\nGenerate a motivational message for the user."
    )
    assert (call.temperature, call.max_tokens) == (0.8, 256)


async def test_no_recent_titles_leaves_the_line_out(encourage, llm):
    llm.script("PebbleVoice", {"message": "Hi.", "mood": "normal"})

    await encourage(ChatContext())

    assert "Recently completed" not in llm.calls[0].user_message


async def test_task_titles_are_redacted_before_the_llm(encourage, llm):
    llm.script("PebbleVoice", {"message": "Nice.", "mood": "happy"})

    await encourage(ChatContext(recent_task_titles=("Email sam@example.com", "Call 555-123-4567")))

    assert "Recently completed: Email [REDACTED], Call [REDACTED]" in llm.calls[0].user_message


async def test_message_is_checked_and_redacted(encourage, llm, safety):
    llm.script("PebbleVoice", {"message": "Write to sam@example.com.", "mood": "happy"})

    result = await encourage(ChatContext())

    assert safety.analyzed == ["Write to sam@example.com."]
    assert result.message == "Write to [REDACTED]."


async def test_unsafe_message_raises(encourage, llm, safety):
    llm.script("PebbleVoice", {"message": "harmful", "mood": "happy"})
    safety.flag("harmful")

    with pytest.raises(UnsafeOutputError):
        await encourage(ChatContext())


async def test_unknown_mood_is_normal(encourage, llm):
    llm.script("PebbleVoice", {"message": "Hi.", "mood": "ecstatic"})

    assert (await encourage(ChatContext())).mood is Mood.NORMAL


@pytest.mark.parametrize("reply", ["prose", {"mood": "happy"}, {"message": "", "mood": "happy"}, {"message": 3}])
async def test_unusable_reply_is_an_agent_reply_error(encourage, llm, reply):
    llm.script("PebbleVoice", reply)

    with pytest.raises(AgentReplyError):
        await encourage(ChatContext())
