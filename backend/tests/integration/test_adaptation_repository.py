"""The AdaptLens store contract, on Postgres and on the in-memory fake."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.adaptation import Signal, SignalKind
from app.infrastructure.db.adaptation import SqlAdaptationRepository
from tests.fakes import InMemoryAdaptationRepository

NOW = datetime(2026, 10, 6, 9, tzinfo=UTC)


@pytest.fixture(params=["postgres", "memory"])
def store(request):
    if request.param == "memory":
        return InMemoryAdaptationRepository()
    return SqlAdaptationRepository(request.getfixturevalue("sessions"))


async def test_signals_come_back_newest_first_and_limited(store):
    for level in (3, 4, 5):
        await store.add_signal("a", Signal(SignalKind.READING_LEVEL, level, NOW))

    assert [s.value for s in await store.recent_signals("a", 10)] == [5, 4, 3]
    assert [s.value for s in await store.recent_signals("a", 2)] == [5, 4]
    assert (await store.recent_signals("a", 1))[0] == Signal(SignalKind.READING_LEVEL, 5, NOW)


async def test_a_later_dismissal_replaces_the_earlier_one(store):
    await store.dismiss("a", "reading_level:3", NOW)
    await store.dismiss("a", "reading_level:3", NOW + timedelta(days=1))

    assert await store.dismissals("a") == {"reading_level:3": NOW + timedelta(days=1)}


async def test_the_store_is_per_user(store):
    await store.add_signal("a", Signal(SignalKind.TASK_FINISHED, 80, NOW))
    await store.dismiss("a", "step_size:large", NOW)

    assert await store.recent_signals("b", 10) == []
    assert await store.dismissals("b") == {}
