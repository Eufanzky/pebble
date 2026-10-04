import pytest

from app.application.preferences import UserPreferences
from app.domain.preferences import Preferences, StepSize
from tests.fakes import InMemoryPreferencesRepository


@pytest.fixture
def repository() -> InMemoryPreferencesRepository:
    return InMemoryPreferencesRepository()


async def test_a_new_user_gets_the_defaults_and_nothing_is_saved(repository):
    assert await UserPreferences(repository).get("u") == Preferences()
    assert repository.saved == {}


async def test_update_changes_only_the_given_fields_and_saves_all(repository):
    prefs = UserPreferences(repository)

    await prefs.update("u", {"calm_mode": True})
    updated = await prefs.update("u", {"step_size": StepSize.SMALL})

    assert updated == Preferences(calm_mode=True, step_size=StepSize.SMALL)
    assert repository.saved["u"]["step_size"] == "small"
    assert await prefs.get("u") == updated


async def test_update_refuses_unknown_fields(repository):
    with pytest.raises(ValueError):
        await UserPreferences(repository).update("u", {"theme": "light"})


async def test_damaged_saved_values_read_as_defaults(repository):
    repository.saved["u"] = {"reading_level": 99, "calm_mode": True}

    assert await UserPreferences(repository).get("u") == Preferences(calm_mode=True)
