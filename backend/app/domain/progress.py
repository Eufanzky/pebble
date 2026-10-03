"""Progress that only adds up (principle 1): what the user finished, and when.

A progress event is written the first time a task or a step is finished, and
for every focus session. Events are never removed: unticking a task, or
deleting it, doesn't take back that it was finished. So every count here can
only stay the same or grow, whatever the gaps between visits.
"""

from collections.abc import Iterable
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta, tzinfo
from enum import StrEnum

from app.domain.tasks import TaskTag


class ProgressKind(StrEnum):
    TASK = "task"
    STEP = "step"
    FOCUS = "focus"


@dataclass(frozen=True)
class ProgressEvent:
    kind: ProgressKind
    item_id: str
    """The task or step finished; for a focus session, an id of its own."""
    at: datetime
    tag: TaskTag | None = None
    minutes: int = 0


@dataclass(frozen=True)
class Totals:
    tasks: int = 0
    steps: int = 0
    focus_minutes: int = 0

    def plus(self, event: ProgressEvent) -> "Totals":
        return Totals(
            tasks=self.tasks + (event.kind is ProgressKind.TASK),
            steps=self.steps + (event.kind is ProgressKind.STEP),
            focus_minutes=self.focus_minutes + (event.minutes if event.kind is ProgressKind.FOCUS else 0),
        )


@dataclass(frozen=True)
class DayProgress:
    day: date
    totals: Totals


@dataclass(frozen=True)
class ProgressSummary:
    start: date
    end: date
    totals: Totals
    """Within the range."""
    by_tag: dict[TaskTag, int]
    """Tasks finished within the range, per tag."""
    days: tuple[DayProgress, ...]
    """Every day of the range, oldest first; a quiet day is simply zero."""
    all_time: Totals = field(default_factory=Totals)


def summarize(events: Iterable[ProgressEvent], today: date, days: int, tz: tzinfo) -> ProgressSummary:
    """The ``days`` days up to and including ``today``, in the user's time zone, plus all-time totals."""
    start = today - timedelta(days=days - 1)
    per_day = {start + timedelta(days=i): Totals() for i in range(days)}
    by_tag = {tag: 0 for tag in TaskTag}
    totals = all_time = Totals()

    for event in events:
        all_time = all_time.plus(event)
        day = event.at.astimezone(tz).date()
        if day not in per_day:
            continue
        per_day[day] = per_day[day].plus(event)
        totals = totals.plus(event)
        if event.kind is ProgressKind.TASK and event.tag is not None:
            by_tag[event.tag] += 1

    return ProgressSummary(
        start=start,
        end=today,
        totals=totals,
        by_tag=by_tag,
        days=tuple(DayProgress(day, t) for day, t in per_day.items()),
        all_time=all_time,
    )
