"""The ``TaskRepository`` contract, run against Postgres and against the in-memory fake the other tests use."""

import uuid
from dataclasses import replace
from datetime import UTC, date, datetime

import pytest

from app.domain.tasks import Task, TaskPriority, TaskStep, TaskTag
from app.infrastructure.db.tasks import SqlTaskRepository
from tests.fakes import InMemoryTaskRepository


def new_id() -> str:
    return str(uuid.uuid4())


def a_task(title: str = "Write the essay", *steps: str) -> Task:
    return Task(
        id=new_id(),
        title=title,
        time_estimate="~30 min",
        tag=TaskTag.STUDY,
        priority=TaskPriority.HIGH,
        why="Due Friday.",
        steps=tuple(TaskStep(new_id(), s, "~5 min") for s in steps),
    )


@pytest.fixture(params=["postgres", "memory"])
def repository(request):
    if request.param == "memory":
        return InMemoryTaskRepository()
    return SqlTaskRepository(request.getfixturevalue("sessions"))


async def test_a_task_round_trips_with_its_steps(repository):
    task = a_task("Essay", "Outline", "Draft")

    await repository.add("a", task)

    assert await repository.get("a", task.id) == task
    assert await repository.list("a") == [task]


async def test_a_due_day_round_trips_and_can_be_cleared(repository):
    """8.3: the day, and the moment it was chosen with its time zone."""
    task = a_task().with_due(date(2026, 10, 20), datetime(2026, 10, 8, 18, 30, tzinfo=UTC))
    await repository.add("a", task)
    assert await repository.get("a", task.id) == task

    cleared = replace(task, due=None, due_set_at=None)
    await repository.save("a", cleared)
    assert await repository.get("a", task.id) == cleared


async def test_tasks_come_back_in_the_order_they_were_added(repository):
    tasks = [a_task(title) for title in ("One", "Two", "Three")]
    for task in tasks:
        await repository.add("a", task)

    assert await repository.list("a") == tasks


async def test_save_updates_fields_and_steps(repository):
    task = a_task("Essay", "Outline", "Draft")
    await repository.add("a", task)
    kept, _dropped = task.steps
    changed = Task(
        id=task.id,
        title="Essay, part 1",
        completed=True,
        steps=(TaskStep(new_id(), "New first step"), TaskStep(kept.id, kept.title, completed=True)),
    )

    await repository.save("a", changed)

    assert await repository.get("a", task.id) == changed


async def test_save_of_an_unknown_task_is_a_key_error(repository):
    with pytest.raises(KeyError):
        await repository.save("a", a_task())


async def test_delete_removes_one_task_and_its_steps(repository):
    first, second = a_task("One", "Step"), a_task("Two")
    await repository.add("a", first)
    await repository.add("a", second)

    assert await repository.delete("a", first.id) is True
    assert await repository.delete("a", first.id) is False
    assert await repository.list("a") == [second]


@pytest.mark.parametrize("task_id", ["not-a-uuid", "00000000-0000-0000-0000-000000000000"])
async def test_an_unknown_id_matches_nothing(repository, task_id):
    assert await repository.get("a", task_id) is None
    assert await repository.delete("a", task_id) is False


async def test_users_never_see_each_others_tasks(repository):
    """User isolation, for every method."""
    mine, theirs = a_task("Mine", "Step"), a_task("Theirs")
    await repository.add("a", mine)
    await repository.add("b", theirs)

    assert await repository.list("a") == [mine]
    assert await repository.get("b", mine.id) is None
    with pytest.raises(KeyError):
        await repository.save("b", Task(mine.id, "Taken over"))
    assert await repository.delete("b", mine.id) is False

    await repository.delete_all("b")

    assert await repository.list("a") == [mine]
    assert await repository.list("b") == []


async def test_reorder_and_new_tasks_go_last(repository):
    one, two, three = a_task("One"), a_task("Two"), a_task("Three")
    for task in (one, two, three):
        await repository.add("a", task)

    await repository.reorder("a", [three.id, one.id, two.id])
    four = a_task("Four")
    await repository.add("a", four)

    assert [t.title for t in await repository.list("a")] == ["Three", "One", "Two", "Four"]


@pytest.mark.parametrize("which", ["missing", "unknown", "not-a-uuid", "someone-elses"])
async def test_reorder_refuses_anything_but_exactly_the_users_tasks(repository, which):
    one, two = a_task("One"), a_task("Two")
    await repository.add("a", one)
    await repository.add("a", two)
    theirs = a_task("Theirs")
    await repository.add("b", theirs)
    order = {
        "missing": [one.id],
        "unknown": [one.id, two.id, new_id()],
        "not-a-uuid": [one.id, "nope"],
        "someone-elses": [one.id, two.id, theirs.id],
    }[which]

    with pytest.raises(KeyError):
        await repository.reorder("a", order)
    assert [t.title for t in await repository.list("a")] == ["One", "Two"]
