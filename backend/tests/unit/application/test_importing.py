from datetime import UTC, datetime, timedelta

import pytest

from app.application.activity import ActivityLog
from app.application.importing import ImportLocalData, ImportResult
from app.application.preferences import UserPreferences
from app.application.tasks import Tasks
from app.domain.activity import ActivityEntry
from app.domain.agents import AgentName
from app.domain.preferences import Preferences
from app.domain.tasks import Task, TaskStep
from tests.fakes import InMemoryActivityRepository, InMemoryPreferencesRepository, InMemoryTaskRepository

NOW = datetime(2026, 9, 29, 12, 0, tzinfo=UTC)
USER = "u"


@pytest.fixture
def stores():
    return InMemoryTaskRepository(), InMemoryPreferencesRepository(), InMemoryActivityRepository()


@pytest.fixture
def importer(stores) -> ImportLocalData:
    tasks, preferences, activity = stores
    return ImportLocalData(
        Tasks(tasks), UserPreferences(preferences), ActivityLog(activity, clock=lambda: NOW), clock=lambda: NOW
    )


def entry(action: str, when: datetime) -> ActivityEntry:
    return ActivityEntry("local-id", when, AgentName.CALM_SENSE, action, "Because.")


async def test_tasks_go_after_the_accounts_own_with_their_steps(importer, stores):
    tasks, _, _ = stores
    await Tasks(tasks).add(USER, Task("", "Mine"))

    result = await importer(USER, [Task("x", "Old", steps=(TaskStep("y", "Done step", completed=True),))], None, [])

    assert result == ImportResult(tasks=1, preferences=False, activity=0)
    listed = await tasks.list(USER)
    assert [t.title for t in listed] == ["Mine", "Old"]
    assert listed[1].id != "x"
    assert listed[1].steps[0].completed is True


async def test_preferences_apply_only_to_an_account_without_any(importer, stores):
    _, preferences, _ = stores

    first = await importer(USER, [], {"calm_mode": True}, [])
    second = await importer(USER, [], {"calm_mode": False, "reading_level": 2}, [])

    assert (first.preferences, second.preferences) == (True, False)
    assert await UserPreferences(preferences).get(USER) == Preferences(calm_mode=True)


async def test_no_preferences_sent_changes_nothing(importer, stores):
    _, preferences, _ = stores

    assert (await importer(USER, [], {}, [])).preferences is False
    assert preferences.saved == {}


async def test_log_entries_keep_their_times_oldest_first_and_never_in_the_future(importer, stores):
    _, _, activity = stores
    newest_first = [entry("Future", NOW + timedelta(days=1)), entry("Old", NOW - timedelta(days=2))]

    result = await importer(USER, [], None, newest_first)

    assert result.activity == 2
    stored = activity.entries[USER]
    assert [e.action for e in stored] == ["Old", "Future"]
    assert stored[0].timestamp == NOW - timedelta(days=2)
    assert stored[1].timestamp == NOW
    assert "local-id" not in {e.id for e in stored}
