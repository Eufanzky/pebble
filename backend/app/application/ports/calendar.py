"""Writing a calendar file (7.7)."""

from collections.abc import Sequence
from typing import Protocol

from app.domain.calendar import CalendarEvent


class CalendarWriter(Protocol):
    def write(self, events: Sequence[CalendarEvent]) -> bytes:
        """The events as one calendar file (iCalendar, RFC 5545)."""
        ...
