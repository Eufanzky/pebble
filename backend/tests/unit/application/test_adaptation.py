"""AdaptLens as use cases: a suggestion applies only when accepted, and a dismissed one stays away (7.6)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.application.activity import ActivityLog
from app.application.adaptation import AdaptLens, SuggestionGoneError, UsageSignals
from app.application.ports.persistence import PersistenceError
from app.application.preferences import UserPreferences
from app.domain.adaptation import SignalKind
from app.domain.agents import AgentName
from app.domain.preferences import StepSize
from app.domain.tasks import Task, TaskStep
from tests.fakes import InMemoryActivityRepository, InMemoryAdaptationRepository, InMemoryPreferencesRepository

USER = "user-a"
START = datetime(2026, 10, 6, 9, tzinfo=UTC)


class Clock:
    def __init__(self):
        self.now = START

    def __call__(self):
        return self.now


@pytest.fixture
def clock():
    return Clock()


@pytest.fixture
def store():
    return InMemoryAdaptationRepository()


@pytest.fixture
def preferences():
    return UserPreferences(InMemoryPreferencesRepository())


@pytest.fixture
def log():
    return InMemoryActivityRepository()


@pytest.fixture
def signals(store, clock):
    return UsageSignals(store, clock)


@pytest.fixture
def adaptlens(store, preferences, log, clock):
    return AdaptLens(store, preferences, ActivityLog(log), clock=clock)


async def read_at(signals, *levels):
    for level in levels:
        await signals.note(USER, SignalKind.READING_LEVEL, level)


async def test_a_suggestion_changes_nothing_until_accepted(adaptlens, signals, preferences):
    await read_at(signals, 3, 3, 3)

    suggestion = await adaptlens.current(USER)

    assert suggestion.key == "reading_level:3"
    assert (await preferences.get(USER)).reading_level == 5


async def test_accepting_applies_it_logs_it_as_adaptlens_and_it_isnt_suggested_again(
    adaptlens, signals, preferences, log
):
    await read_at(signals, 3, 3, 3)

    updated = await adaptlens.accept(USER, "reading_level:3")

    assert updated.reading_level == 3
    assert (await preferences.get(USER)).reading_level == 3
    [entry] = log.entries[USER]
    assert (entry.agent, entry.action) == (AgentName.ADAPT_LENS, "Set your default reading level to 3, as you accepted")
    assert entry.reasoning.startswith("You picked level 3 for 3 of your last 3 documents.")
    assert await adaptlens.current(USER) is None


async def test_accepting_a_suggestion_that_isnt_current_changes_nothing(adaptlens, signals, preferences):
    await read_at(signals, 3, 3, 3)

    with pytest.raises(SuggestionGoneError):
        await adaptlens.accept(USER, "reading_level:4")

    assert (await preferences.get(USER)).reading_level == 5


async def test_a_dismissed_suggestion_stays_away_for_fourteen_days(adaptlens, signals, clock):
    await read_at(signals, 3, 3, 3)

    await adaptlens.dismiss(USER, "reading_level:3")
    assert await adaptlens.current(USER) is None

    clock.now = START + timedelta(days=13)
    assert await adaptlens.current(USER) is None

    clock.now = START + timedelta(days=14)
    assert (await adaptlens.current(USER)).key == "reading_level:3"


async def test_finishing_a_task_with_steps_notes_how_many_were_still_open(signals, store):
    steps = (TaskStep("a", "One", completed=True), TaskStep("b", "Two"), TaskStep("c", "Three"), TaskStep("d", "Four"))
    before = Task("t", "Essay", steps=steps)

    await signals.task_finished(USER, before, Task("t", "Essay", completed=True, steps=steps))

    [signal] = store.signals[USER]
    assert (signal.kind, signal.value) == (SignalKind.TASK_FINISHED, 75)


@pytest.mark.parametrize(
    ("before", "after"),
    [
        (Task("t", "Walk"), Task("t", "Walk", completed=True)),
        (
            Task("t", "Essay", completed=True, steps=(TaskStep("a", "One"),)),
            Task("t", "Essay", completed=True, steps=(TaskStep("a", "One"),)),
        ),
    ],
    ids=["no-steps", "already-done"],
)
async def test_only_a_newly_finished_task_with_steps_is_noted(signals, store, before, after):
    await signals.task_finished(USER, before, after)

    assert store.signals == {}


async def test_larger_steps_after_most_steps_are_skipped(adaptlens, signals):
    for _ in range(3):
        await signals.note(USER, SignalKind.TASK_FINISHED, 80)

    suggestion = await adaptlens.current(USER)

    assert (suggestion.preference, suggestion.value) == ("step_size", StepSize.LARGE)


async def test_a_signal_that_cant_be_saved_never_costs_the_action(clock):
    class Down(InMemoryAdaptationRepository):
        async def add_signal(self, user_id, signal):
            raise PersistenceError("down")

    await UsageSignals(Down(), clock).note(USER, SignalKind.READING_LEVEL, 3)
