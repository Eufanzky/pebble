"""Breaking down a saved task with CalmSense: what it asks, what it keeps, and what it leaves alone."""

import pytest

from app.application.errors import UnsafeContentError
from app.application.ports.llm import LLMUnavailableError
from app.application.tasks import TaskNotFoundError
from app.domain.agents import AgentName
from app.domain.tasks import Task, TaskStep

USER = "user-a"
REPLY = {
    "title": "Write the essay",
    "steps": [
        {"title": "Open the doc", "timeEstimate": "~5 min"},
        {"title": "Write one line", "timeEstimate": "~10 min"},
    ],
    "whyExplanation": "Small steps, easiest first.",
}


@pytest.fixture
def break_down(container):
    return container.break_down_task


@pytest.fixture
async def task(container) -> Task:
    return await container.tasks.add(USER, Task("", "Write the essay"))


async def test_asks_calmsense_with_the_saved_step_size_and_keeps_its_steps_and_why(
    break_down, task, container, llm, preferences_repository
):
    preferences_repository.saved[USER] = {"step_size": "small"}
    llm.script("CalmSense", REPLY)
    llm.script("WhyBot", {"why": "Your step size is small, and it's evening."})

    result = await break_down(USER, task.id, "evening")

    call, why_call = llm.calls
    assert why_call.agent == "WhyBot"
    assert "Task: Write the essay" in call.user_message
    assert "User's preferred step size: small" in call.user_message
    assert "Current time of day: evening" in call.user_message
    assert [(s.title, s.time_estimate, s.completed) for s in result.steps] == [
        ("Open the doc", "~5 min", False),
        ("Write one line", "~10 min", False),
    ]
    assert result.why == "Your step size is small, and it's evening."
    assert await container.tasks.get(USER, task.id) == result


async def test_replaces_steps_the_task_had(break_down, container, llm):
    task = await container.tasks.add(USER, Task("", "Tidy up", steps=(TaskStep("", "Old step", completed=True),)))
    llm.script("CalmSense", REPLY)

    result = await break_down(USER, task.id)

    assert [s.title for s in result.steps] == ["Open the doc", "Write one line"]


async def test_the_result_goes_in_the_activity_log(break_down, task, llm, activity_repository):
    llm.script("CalmSense", REPLY)

    await break_down(USER, task.id)

    [entry] = activity_repository.entries[USER]
    assert entry.agent is AgentName.CALM_SENSE
    assert entry.action == 'Broke "Write the essay" into 2 steps'


async def test_another_users_task_is_not_found_and_calmsense_isnt_asked(break_down, task, llm):
    with pytest.raises(TaskNotFoundError):
        await break_down("user-b", task.id)

    assert llm.calls == []


async def test_a_held_back_title_never_reaches_calmsense_and_nothing_changes(break_down, task, container, llm, safety):
    safety.flag("Write the essay")

    with pytest.raises(UnsafeContentError):
        await break_down(USER, task.id)

    assert llm.calls == []
    assert await container.tasks.get(USER, task.id) == task


async def test_if_calmsense_cant_answer_nothing_changes(break_down, task, container, llm):
    llm.script("CalmSense", LLMUnavailableError("down"))

    with pytest.raises(LLMUnavailableError):
        await break_down(USER, task.id)

    assert await container.tasks.get(USER, task.id) == task
