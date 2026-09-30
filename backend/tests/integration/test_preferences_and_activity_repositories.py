"""The preferences and activity store contracts, on Postgres and on the in-memory fakes."""

import uuid
from datetime import UTC, datetime, timedelta

import pytest

from app.domain.activity import ActivityEntry, SafetyStatus
from app.domain.agents import AgentName
from app.infrastructure.db.activity import SqlActivityRepository
from app.infrastructure.db.preferences import SqlPreferencesRepository
from tests.fakes import InMemoryActivityRepository, InMemoryPreferencesRepository

NOW = datetime(2026, 9, 29, 9, 30, tzinfo=UTC)


@pytest.fixture(params=["postgres", "memory"])
def preferences(request):
    if request.param == "memory":
        return InMemoryPreferencesRepository()
    return SqlPreferencesRepository(request.getfixturevalue("sessions"))


@pytest.fixture(params=["postgres", "memory"])
def activity(request):
    if request.param == "memory":
        return InMemoryActivityRepository()
    return SqlActivityRepository(request.getfixturevalue("sessions"))


def entry(action: str, minutes: int = 0, status: SafetyStatus = SafetyStatus.PASSED) -> ActivityEntry:
    return ActivityEntry(
        str(uuid.uuid4()), NOW + timedelta(minutes=minutes), AgentName.CALM_SENSE, action, "Because.", status
    )


async def test_preferences_nothing_saved_is_none(preferences):
    assert await preferences.get("a") is None


async def test_preferences_save_then_overwrite(preferences):
    await preferences.save("a", {"calm_mode": True, "reading_level": 3})
    await preferences.save("a", {"calm_mode": False})

    assert await preferences.get("a") == {"calm_mode": False}


async def test_preferences_are_per_user(preferences):
    await preferences.save("a", {"calm_mode": True})

    assert await preferences.get("b") is None


async def test_activity_round_trips_newest_first(activity):
    first, second = entry("First"), entry("Second", status=SafetyStatus.FLAGGED)
    await activity.add("a", first)
    await activity.add("a", second)

    assert await activity.recent("a", 10) == [second, first]
    assert await activity.recent("a", 1) == [second]


async def test_activity_order_is_insertion_order_even_with_equal_times(activity):
    entries = [entry(f"Entry {n}") for n in range(3)]
    for e in entries:
        await activity.add("a", e)

    assert [e.action for e in await activity.recent("a", 10)] == ["Entry 2", "Entry 1", "Entry 0"]


async def test_activity_is_per_user(activity):
    await activity.add("a", entry("Mine"))

    assert await activity.recent("b", 10) == []
