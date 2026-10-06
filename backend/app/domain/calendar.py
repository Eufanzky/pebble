"""BridgeBot's plan for a calendar (7.7): a task's open steps, one after another, each as long as its estimate."""

import re
from dataclasses import dataclass
from datetime import datetime, timedelta

from app.domain.tasks import Task

DEFAULT_MINUTES = 15
MAX_MINUTES = 240


@dataclass(frozen=True)
class CalendarEvent:
    title: str
    start: datetime
    end: datetime
    description: str


def minutes_of(estimate: str) -> int:
    """Minutes from an estimate such as "~25 min", "1 h" or "1.5 hours"; 15 when there's no number."""
    match = re.search(r"(\d+(?:[.,]\d+)?)\s*(h|hr|hour)?", estimate, re.IGNORECASE)
    if not match:
        return DEFAULT_MINUTES
    amount = float(match.group(1).replace(",", "."))
    minutes = round(amount * 60) if match.group(2) else round(amount)
    return max(1, min(minutes, MAX_MINUTES))


def plan(task: Task, start: datetime) -> list[CalendarEvent]:
    """The open steps back to back from ``start``; a task without open steps is one event of its own."""
    note = f'A step of "{task.title}", planned by Pebble.'
    parts = [(s.title, s.time_estimate, note) for s in task.steps if not s.completed]
    if not parts:
        parts = [(task.title, task.time_estimate, "Planned by Pebble.")]
    events, at = [], start
    for title, estimate, description in parts:
        end = at + timedelta(minutes=minutes_of(estimate))
        events.append(CalendarEvent(title, at, end, description))
        at = end
    return events
