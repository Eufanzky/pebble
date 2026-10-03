from datetime import UTC, datetime
from zoneinfo import ZoneInfo

import pytest

from app.application.ports.persistence import PersistenceError
from app.application.progress import ProgressLog, ProgressStats
from app.application.tasks import Tasks
from app.domain.progress import ProgressKind
from app.domain.tasks import Task, TaskStep, TaskTag
from tests.fakes import InMemoryProgressRepository, InMemoryTaskRepository

NOW = datetime(2026, 10, 3, 12, tzinfo=UTC)
USER = "u"


@pytest.fixture
def progress() -> InMemoryProgressRepository:
    return InMemoryProgressRepository()


@pytest.fixture
def tasks(progress) -> Tasks:
    return Tasks(InMemoryTaskRepository(), progress=ProgressLog(progress, clock=lambda: NOW))


def kinds(progress) -> list[tuple[str, str]]:
    return [(str(e.kind), e.item_id) for e in progress.events.get(USER, [])]


async def test_finishing_a_task_is_noted_once_even_if_unticked_and_ticked_again(tasks, progress):
    added = await tasks.add(USER, Task("", "Walk", tag=TaskTag.WELLBEING))

    await tasks.update(USER, added.id, {"completed": True})
    await tasks.update(USER, added.id, {"completed": False})
    await tasks.update(USER, added.id, {"completed": True})

    assert kinds(progress) == [("task", added.id)]
    assert progress.events[USER][0].tag is TaskTag.WELLBEING
    assert progress.events[USER][0].at == NOW


async def test_finishing_steps_notes_each_step_and_then_the_task(tasks, progress):
    added = await tasks.add(USER, Task("", "Essay", steps=(TaskStep("", "Outline"), TaskStep("", "Draft"))))
    first, last = added.steps

    await tasks.set_step_completed(USER, added.id, first.id, True)
    await tasks.set_step_completed(USER, added.id, last.id, True)

    assert kinds(progress) == [("step", first.id), ("step", last.id), ("task", added.id)]


async def test_edits_that_finish_nothing_note_nothing(tasks, progress):
    added = await tasks.add(USER, Task("", "Essay"))

    await tasks.update(USER, added.id, {"title": "Essay, part 1"})

    assert kinds(progress) == []


async def test_a_note_that_cannot_be_saved_never_costs_the_change(tasks, progress):
    added = await tasks.add(USER, Task("", "Walk"))

    async def down(user_id, event):
        raise PersistenceError("down")

    progress.add = down
    updated = await tasks.update(USER, added.id, {"completed": True})

    assert updated.completed


async def test_focus_sessions_each_count(progress):
    log = ProgressLog(progress, clock=lambda: NOW)

    await log.focus(USER, 25)
    await log.focus(USER, 25)

    assert [(e.kind, e.minutes) for e in progress.events[USER]] == [(ProgressKind.FOCUS, 25)] * 2


@pytest.mark.parametrize("minutes", [0, -5, 181])
async def test_a_focus_session_is_1_to_180_minutes(progress, minutes):
    with pytest.raises(ValueError):
        await ProgressLog(progress).focus(USER, minutes)


async def test_the_summary_uses_today_in_the_users_time_zone(progress):
    log = ProgressLog(progress, clock=lambda: datetime(2026, 10, 3, 23, 30, tzinfo=UTC))
    await log.focus(USER, 20)
    stats = ProgressStats(progress, clock=lambda: datetime(2026, 10, 3, 23, 30, tzinfo=UTC))

    summary = await stats.summary(USER, 7, ZoneInfo("Asia/Tokyo"))

    assert summary.end.isoformat() == "2026-10-04"
    assert summary.days[-1].totals.focus_minutes == 20
