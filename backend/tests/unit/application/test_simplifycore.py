"""SimplifyCore as a use case: the prompt, reading the reply, safety, groundedness and redaction."""

import pytest

from app.application.agents.simplifycore import SimplifyDocument
from app.application.errors import AgentReplyError, UnsafeContentError, UnsafeOutputError
from app.application.prompts import SIMPLIFYCORE_PROMPT
from app.application.safety import SafetyGate
from app.domain.documents import ExtractedTask, Simplification
from app.domain.safety import Groundedness
from app.domain.tasks import TaskTag
from app.infrastructure.llm.fake import FakeLLM
from app.infrastructure.pii.regex_redactor import RegexPIIRedactor
from tests.fakes import ScriptedSafety

REPLY = {
    "simplified": "Hand in the form by Friday.",
    "extractedTasks": [{"title": "Hand in the form", "timeEstimate": "~10 min", "tag": "project"}],
    "tags": ["forms"],
    "whyExplanation": "I kept only the action.",
}


@pytest.fixture
def llm():
    return FakeLLM()


@pytest.fixture
def safety():
    return ScriptedSafety()


@pytest.fixture
def simplifycore(llm, safety):
    return SimplifyDocument(llm, SafetyGate(safety, RegexPIIRedactor()))


async def test_builds_the_request_and_reads_the_reply(simplifycore, llm):
    llm.script("SimplifyCore", REPLY)

    result = await simplifycore.run("The form must be submitted by Friday.", 3)

    assert result == Simplification(
        simplified="Hand in the form by Friday.",
        extracted_tasks=(ExtractedTask("Hand in the form", "~10 min", TaskTag.PROJECT),),
        tags=("forms",),
        why="I kept only the action.",
        groundedness=Groundedness(grounded=True, ungrounded_percentage=0.0),
    )
    [call] = llm.calls
    assert call.system_prompt == SIMPLIFYCORE_PROMPT
    assert call.user_message == "Target reading level: 3/10\n\nDocument text:\nThe form must be submitted by Friday."
    assert (call.temperature, call.max_tokens) == (0.5, 2048)


async def test_reports_ungrounded_output(simplifycore, llm, safety):
    llm.script("SimplifyCore", REPLY)
    safety.grounded = False

    result = await simplifycore.run("Text", 5)

    assert result.groundedness == Groundedness(grounded=False, ungrounded_percentage=0.5)


async def test_unknown_task_tags_become_project(simplifycore, llm):
    llm.script("SimplifyCore", {**REPLY, "extractedTasks": [{"title": "Read", "tag": "homework"}, {"title": "Rest"}]})

    result = await simplifycore.run("Text", 5)

    assert [t.tag for t in result.extracted_tasks] == [TaskTag.PROJECT, TaskTag.PROJECT]


async def test_direct_call_screens_and_redacts_the_input(simplifycore, llm, safety):
    llm.script("SimplifyCore", REPLY)

    await simplifycore("Contact sam@example.com by Friday.")

    assert safety.shielded == ["Contact sam@example.com by Friday."]
    assert "sam@example.com" not in llm.sent_text()


async def test_direct_call_rejects_unsafe_input(simplifycore, llm, safety):
    safety.flag("hurt")

    with pytest.raises(UnsafeContentError):
        await simplifycore("hurt")

    assert llm.calls == []


async def test_output_is_checked_once_and_every_text_redacted(simplifycore, llm, safety):
    llm.script(
        "SimplifyCore",
        {
            "simplified": "Mail sam@example.com.",
            "extractedTasks": [{"title": "Call 555-123-4567"}],
            "tags": ["x@y.io"],
            "whyExplanation": "Kept sam@example.com.",
        },
    )

    result = await simplifycore.run("Text", 5)

    assert safety.analyzed == ["Mail sam@example.com.\nCall 555-123-4567\nx@y.io\nKept sam@example.com."]
    assert "example.com" not in " ".join(result.texts())
    assert "555-123-4567" not in " ".join(result.texts())


async def test_unsafe_output_raises(simplifycore, llm, safety):
    llm.script("SimplifyCore", REPLY)
    safety.flag("Hand in the form")

    with pytest.raises(UnsafeOutputError):
        await simplifycore.run("Text", 5)


@pytest.mark.parametrize(
    "reply",
    [
        "not json",
        {**REPLY, "simplified": ""},
        {**REPLY, "simplified": 3},
        {**REPLY, "extractedTasks": "none"},
        {**REPLY, "extractedTasks": [{"tag": "study"}]},
        {**REPLY, "tags": "forms"},
    ],
    ids=["prose", "empty-text", "text-not-a-string", "tasks-not-a-list", "task-without-title", "tags-not-a-list"],
)
async def test_unusable_reply_is_an_agent_reply_error(simplifycore, llm, reply):
    llm.script("SimplifyCore", reply)

    with pytest.raises(AgentReplyError):
        await simplifycore.run("Text", 5)
