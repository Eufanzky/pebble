"""AdaptLens's rules: when a few recent signals agree, one plain suggestion, never a change by itself (7.6)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.adaptation import QUIET_AFTER_DISMISS, Signal, SignalKind, Suggestion, still_quiet, suggest
from app.domain.preferences import Preferences, StepSize

NOW = datetime(2026, 10, 6, 9, tzinfo=UTC)


def levels(*values: int) -> list[Signal]:
    """Reading-level signals, newest first."""
    return [Signal(SignalKind.READING_LEVEL, v, NOW) for v in values]


def finished(*shares: int) -> list[Signal]:
    """Finished-task signals (the share of steps still open), newest first."""
    return [Signal(SignalKind.TASK_FINISHED, v, NOW) for v in shares]


def test_suggests_the_reading_level_most_recent_documents_were_read_at():
    suggestion = suggest(levels(3, 3, 5, 3), Preferences(reading_level=5), set())

    assert suggestion == Suggestion(
        "reading_level:3", "reading_level", 3, "You picked level 3 for 3 of your last 4 documents. Your default is 5."
    )


@pytest.mark.parametrize(
    "signals",
    [levels(3, 3), levels(3, 4, 5, 3), levels(5, 5, 5)],
    ids=["too-few", "no-agreement", "already-the-default"],
)
def test_no_reading_level_suggestion_without_a_clear_pattern(signals):
    assert suggest(signals, Preferences(reading_level=5), set()) is None


def test_only_the_five_newest_documents_count():
    # The five newest are 4, 4, 6, 6, 6: the three older 3s don't count
    assert suggest(levels(4, 4, 6, 6, 6, 3, 3, 3), Preferences(reading_level=5), set()).key == "reading_level:6"


@pytest.mark.parametrize(("size", "larger"), [(StepSize.SMALL, StepSize.MEDIUM), (StepSize.MEDIUM, StepSize.LARGE)])
def test_suggests_larger_steps_when_most_get_skipped(size, larger):
    suggestion = suggest(finished(80, 60, 0, 100), Preferences(step_size=size), set())

    assert (suggestion.key, suggestion.preference, suggestion.value) == (f"step_size:{larger}", "step_size", larger)
    assert suggestion.reason.startswith("You finished 3 of your last 4 broken-down tasks with most of their steps")


@pytest.mark.parametrize(
    ("signals", "size"),
    [
        (finished(80, 60), StepSize.MEDIUM),
        (finished(80, 20, 0, 40), StepSize.MEDIUM),
        (finished(90, 90, 90), StepSize.LARGE),
    ],
    ids=["too-few", "mostly-done", "already-largest"],
)
def test_no_step_size_suggestion_without_a_clear_pattern(signals, size):
    assert suggest(signals, Preferences(step_size=size), set()) is None


def test_a_dismissed_suggestion_is_skipped_and_the_next_one_offered():
    signals = levels(3, 3, 3) + finished(90, 90, 90)

    suggestion = suggest(signals, Preferences(), {"reading_level:3"})

    assert suggestion.key == "step_size:large"


def test_a_dismissal_keeps_a_suggestion_away_for_fourteen_days():
    assert still_quiet(NOW, NOW + QUIET_AFTER_DISMISS - timedelta(minutes=1))
    assert not still_quiet(NOW, NOW + QUIET_AFTER_DISMISS)
