"""The preferences store contract, on Postgres and on the in-memory fake."""

import pytest

from app.infrastructure.db.preferences import SqlPreferencesRepository
from tests.fakes import InMemoryPreferencesRepository


@pytest.fixture(params=["postgres", "memory"])
def preferences(request):
    if request.param == "memory":
        return InMemoryPreferencesRepository()
    return SqlPreferencesRepository(request.getfixturevalue("sessions"))


async def test_preferences_nothing_saved_is_none(preferences):
    assert await preferences.get("a") is None


async def test_preferences_save_then_overwrite(preferences):
    await preferences.save("a", {"calm_mode": True, "reading_level": 3})
    await preferences.save("a", {"calm_mode": False})

    assert await preferences.get("a") == {"calm_mode": False}


async def test_preferences_are_per_user(preferences):
    await preferences.save("a", {"calm_mode": True})

    assert await preferences.get("b") is None
