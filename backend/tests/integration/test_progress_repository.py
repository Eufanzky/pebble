"""The progress store contract, on Postgres and on the in-memory fake."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.progress import ProgressEvent, ProgressKind
from app.domain.tasks import TaskTag
from app.infrastructure.db.progress import SqlProgressRepository
from tests.fakes import InMemoryProgressRepository

NOW = datetime(2026, 10, 3, 12, tzinfo=UTC)


@pytest.fixture(params=["postgres", "memory"])
def progress(request):
    if request.param == "memory":
        return InMemoryProgressRepository()
    return SqlProgressRepository(request.getfixturevalue("sessions"))


async def test_events_round_trip_oldest_first(progress):
    later = ProgressEvent(ProgressKind.FOCUS, "f1", NOW + timedelta(hours=1), minutes=25)
    earlier = ProgressEvent(ProgressKind.TASK, "t1", NOW, tag=TaskTag.STUDY)

    assert await progress.add("a", later) is True
    assert await progress.add("a", earlier) is True

    assert await progress.list("a") == [earlier, later]


async def test_the_same_item_finished_twice_is_kept_once(progress):
    first = ProgressEvent(ProgressKind.STEP, "s1", NOW)

    assert await progress.add("a", first) is True
    assert await progress.add("a", ProgressEvent(ProgressKind.STEP, "s1", NOW + timedelta(days=1))) is False
    # The same id as another kind, or for another user, is its own event
    assert await progress.add("a", ProgressEvent(ProgressKind.TASK, "s1", NOW)) is True
    assert await progress.add("b", first) is True

    assert [e.kind for e in await progress.list("a")] == [ProgressKind.STEP, ProgressKind.TASK]


async def test_progress_is_per_user(progress):
    await progress.add("a", ProgressEvent(ProgressKind.FOCUS, "f1", NOW, minutes=25))

    assert await progress.list("b") == []
