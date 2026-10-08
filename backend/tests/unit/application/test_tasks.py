import itertools
from datetime import UTC, date, datetime

import pytest

from app.application.tasks import TaskFinishedError, TaskNotFoundError, TaskOrderError, Tasks
from app.domain.tasks import Step, Task, TaskPriority, TaskStep
from tests.fakes import InMemoryTaskRepository

USER = "user-a"


@pytest.fixture
def repository() -> InMemoryTaskRepository:
    return InMemoryTaskRepository()


@pytest.fixture
def tasks(repository) -> Tasks:
    counter = itertools.count(1)
    return Tasks(repository, make_id=lambda: f"id-{next(counter)}")


async def test_add_picks_the_ids_and_stores_the_task(tasks, repository):
    added = await tasks.add(USER, Task("ignored", "Email Sam", steps=(TaskStep("ignored", "Open mail"),)))

    assert added.id == "id-1"
    assert added.steps[0].id == "id-2"
    assert await repository.list(USER) == [added]


async def test_update_changes_only_the_given_fields(tasks):
    added = await tasks.add(USER, Task("", "Email Sam"))

    updated = await tasks.update(USER, added.id, {"completed": True, "priority": TaskPriority.HIGH})

    assert updated == Task(added.id, "Email Sam", priority=TaskPriority.HIGH, completed=True)
    assert await tasks.list(USER) == [updated]


async def test_update_refuses_fields_that_are_not_editable(tasks):
    added = await tasks.add(USER, Task("", "Email Sam"))

    with pytest.raises(ValueError):
        await tasks.update(USER, added.id, {"id": "other"})


async def test_set_steps_replaces_the_steps_with_open_ones(tasks):
    added = await tasks.add(USER, Task("", "Essay", steps=(TaskStep("", "Old", completed=True),)))

    updated = await tasks.set_steps(USER, added.id, [Step("Outline", "~10 min"), Step("Draft")])

    assert [(s.title, s.time_estimate, s.completed) for s in updated.steps] == [
        ("Outline", "~10 min", False),
        ("Draft", "", False),
    ]


async def test_finishing_the_last_step_finishes_the_task(tasks):
    added = await tasks.add(USER, Task("", "Essay", steps=(TaskStep("", "Outline"),)))

    updated = await tasks.set_step_completed(USER, added.id, added.steps[0].id, True)

    assert updated.completed
    assert (await tasks.list(USER))[0].completed


@pytest.mark.parametrize(
    "call",
    [
        lambda t, task_id: t.update(USER, task_id, {"completed": True}),
        lambda t, task_id: t.set_steps(USER, task_id, []),
        lambda t, task_id: t.set_step_completed(USER, task_id, "id-2", True),
        lambda t, task_id: t.delete(USER, task_id),
    ],
    ids=["update", "set_steps", "set_step_completed", "delete"],
)
async def test_an_unknown_task_is_not_found(tasks, call):
    with pytest.raises(TaskNotFoundError):
        await call(tasks, "missing")


async def test_an_unknown_step_is_not_found(tasks):
    added = await tasks.add(USER, Task("", "Essay"))

    with pytest.raises(TaskNotFoundError):
        await tasks.set_step_completed(USER, added.id, "missing", True)


async def test_a_task_deleted_meanwhile_is_not_found_on_save(tasks, repository):
    """The task disappears between the read and the write (another tab cleared the list)."""
    added = await tasks.add(USER, Task("", "Essay"))

    async def vanish(user_id, task):
        raise KeyError(task.id)

    repository.save = vanish
    with pytest.raises(TaskNotFoundError):
        await tasks.update(USER, added.id, {"completed": True})


async def test_delete_and_clear(tasks):
    first = await tasks.add(USER, Task("", "One"))
    await tasks.add(USER, Task("", "Two"))

    await tasks.delete(USER, first.id)
    assert [t.title for t in await tasks.list(USER)] == ["Two"]

    await tasks.clear(USER)
    assert await tasks.list(USER) == []


async def test_the_default_ids_are_uuids(repository):
    added = await Tasks(repository).add(USER, Task("", "One"))

    assert len(added.id) == 36


async def test_reorder_puts_the_tasks_in_the_order_given(tasks):
    one, two, three = [await tasks.add(USER, Task("", title)) for title in ("One", "Two", "Three")]

    ordered = await tasks.reorder(USER, [three.id, one.id, two.id])

    assert [t.title for t in ordered] == ["Three", "One", "Two"]
    assert [t.title for t in await tasks.list(USER)] == ["Three", "One", "Two"]


@pytest.mark.parametrize(
    "order", [["id-1"], ["id-1", "id-1"], ["id-1", "id-2", "id-9"]], ids=["missing", "twice", "unknown"]
)
async def test_reorder_needs_every_task_exactly_once(tasks, order):
    await tasks.add(USER, Task("", "One"))
    await tasks.add(USER, Task("", "Two"))

    with pytest.raises(TaskOrderError):
        await tasks.reorder(USER, order)
    assert [t.title for t in await tasks.list(USER)] == ["One", "Two"]


async def test_removing_a_breakdown_drops_the_steps_and_why_and_keeps_the_rest(tasks):
    added = await tasks.add(USER, Task("", "Essay", priority=TaskPriority.HIGH))
    await tasks.set_breakdown(USER, added.id, [Step("Outline"), Step("Draft")], "Small steps.")

    task = await tasks.remove_breakdown(USER, added.id)

    assert (task.steps, task.why) == ((), "")
    assert (task.title, task.priority, task.completed) == ("Essay", TaskPriority.HIGH, False)
    assert await tasks.get(USER, added.id) == task


async def test_removing_a_breakdown_of_an_unknown_task_is_not_found(tasks):
    with pytest.raises(TaskNotFoundError):
        await tasks.remove_breakdown(USER, "nope")


async def test_a_due_day_starts_its_bar_when_it_is_chosen(repository):
    """8.3, with a fixed clock: adding with a day, changing it, keeping it, and clearing it."""
    now = [datetime(2026, 10, 1, 9, tzinfo=UTC)]
    tasks = Tasks(repository, clock=lambda: now[0])

    added = await tasks.add(USER, Task("", "Essay", due=date(2026, 10, 10)))
    now[0] = datetime(2026, 10, 3, 9, tzinfo=UTC)
    kept = await tasks.update(USER, added.id, {"due": date(2026, 10, 10), "title": "Essay draft"})
    moved = await tasks.update(USER, added.id, {"due": date(2026, 10, 12)})
    cleared = await tasks.update(USER, added.id, {"due": None})

    assert (added.due, added.due_set_at) == (date(2026, 10, 10), datetime(2026, 10, 1, 9, tzinfo=UTC))
    assert kept.due_set_at == added.due_set_at
    assert (moved.due, moved.due_set_at) == (date(2026, 10, 12), datetime(2026, 10, 3, 9, tzinfo=UTC))
    assert (cleared.due, cleared.due_set_at) == (None, None)


async def test_the_three_still_open_choices(repository):
    """8.4: move it (a new due day), make it smaller (new steps), or let it go (and take it back)."""
    now = [datetime(2026, 10, 8, 9, tzinfo=UTC)]
    tasks = Tasks(repository, clock=lambda: now[0])
    task = await tasks.add(USER, Task("", "Essay", due=date(2026, 10, 1)))

    moved = await tasks.update(USER, task.id, {"due": date(2026, 10, 12)})
    smaller = await tasks.set_breakdown(USER, task.id, [Step("Open the doc", "~5 min")], "One small step.")
    gone = await tasks.let_go(USER, task.id)

    assert (moved.due, moved.due_set_at) == (date(2026, 10, 12), now[0])
    assert [s.title for s in smaller.steps] == ["Open the doc"]
    assert gone.let_go_at == now[0]
    assert await tasks.list(USER) == []
    assert (await tasks.take_back(USER, task.id)).let_go_at is None
    assert [t.title for t in await tasks.list(USER)] == ["Essay"]


async def test_a_finished_task_cannot_be_let_go(tasks):
    task = await tasks.add(USER, Task("", "Essay", completed=True))

    with pytest.raises(TaskFinishedError):
        await tasks.let_go(USER, task.id)
