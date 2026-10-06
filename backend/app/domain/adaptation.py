"""AdaptLens: what Pebble notices about how the user works, and the preference change it suggests (7.6).

Suggestions come from simple, explainable rules over a few recent signals. A suggestion applies only when the
user accepts it, and a dismissed one stays away for a while.
"""

from collections import Counter
from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import StrEnum

from app.domain.preferences import Preferences, StepSize

# How many recent signals a rule looks at, and how many must agree.
LOOK_AT = 5
AGREE = 3
# A dismissed suggestion doesn't come back sooner than this.
QUIET_AFTER_DISMISS = timedelta(days=14)
# A task finished with at least this share of its steps still open counts as "steps skipped".
SKIPPED_SHARE = 50


class SignalKind(StrEnum):
    READING_LEVEL = "reading_level"
    """The reading level the user picked for a document. Value: the level (1-10)."""
    TASK_FINISHED = "task_finished"
    """A task with steps was finished. Value: the share of its steps still open, in percent."""


@dataclass(frozen=True)
class Signal:
    kind: SignalKind
    value: int
    at: datetime


@dataclass(frozen=True)
class Suggestion:
    key: str
    """Names the suggestion, so a dismissal can be remembered: ``reading_level:3``."""
    preference: str
    value: int | str
    reason: str
    """What AdaptLens noticed, in plain words."""


LARGER = {StepSize.SMALL: StepSize.MEDIUM, StepSize.MEDIUM: StepSize.LARGE}


def suggest(
    signals: Sequence[Signal], preferences: Preferences, dismissed: set[str]
) -> Suggestion | None:
    """The one suggestion worth making now, if any. ``signals`` are newest first; ``dismissed`` are keys to skip."""
    for rule in (_reading_level, _step_size):
        suggestion = rule(signals, preferences)
        if suggestion is not None and suggestion.key not in dismissed:
            return suggestion
    return None


def still_quiet(dismissed_at: datetime, now: datetime) -> bool:
    """Whether a suggestion dismissed at ``dismissed_at`` should stay away at ``now``."""
    return now - dismissed_at < QUIET_AFTER_DISMISS


def _recent(signals: Sequence[Signal], kind: SignalKind) -> list[int]:
    return [s.value for s in signals if s.kind is kind][:LOOK_AT]


def _reading_level(signals: Sequence[Signal], preferences: Preferences) -> Suggestion | None:
    """Most recent documents read at the same level, and it isn't the default: suggest it."""
    levels = _recent(signals, SignalKind.READING_LEVEL)
    if len(levels) < AGREE:
        return None
    level, count = Counter(levels).most_common(1)[0]
    if count < AGREE or level == preferences.reading_level:
        return None
    return Suggestion(
        f"reading_level:{level}",
        "reading_level",
        level,
        f"You picked level {level} for {count} of your last {len(levels)} documents. "
        f"Your default is {preferences.reading_level}.",
    )


def _step_size(signals: Sequence[Signal], preferences: Preferences) -> Suggestion | None:
    """Most recent broken-down tasks finished with most steps still open: suggest larger steps."""
    finished = _recent(signals, SignalKind.TASK_FINISHED)
    larger = LARGER.get(preferences.step_size)
    if len(finished) < AGREE or larger is None:
        return None
    skipped = sum(1 for share in finished if share >= SKIPPED_SHARE)
    if skipped < AGREE:
        return None
    return Suggestion(
        f"step_size:{larger}",
        "step_size",
        larger,
        f"You finished {skipped} of your last {len(finished)} broken-down tasks with most of their steps "
        f"still open. Larger steps might fit you better.",
    )
