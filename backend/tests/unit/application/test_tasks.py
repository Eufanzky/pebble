import itertools

import pytest

from app.application.tasks import TaskNotFoundError, TaskOrderError, Tasks
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
