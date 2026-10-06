"""``CalendarWriter`` with the icalendar library: one VEVENT per planned event, times in UTC."""

import uuid
from collections.abc import Callable, Sequence
from datetime import UTC, datetime

from icalendar import Calendar, Event

from app.domain.calendar import CalendarEvent


class IcsCalendarWriter:
    def __init__(self, clock: Callable[[], datetime] = lambda: datetime.now(UTC)) -> None:
        self.clock = clock

    def write(self, events: Sequence[CalendarEvent]) -> bytes:
        calendar = Calendar()
        calendar.add("prodid", "-//Pebble//BridgeBot//EN")
        calendar.add("version", "2.0")
        calendar.add("calscale", "GREGORIAN")
        stamp = self.clock().astimezone(UTC)
        for item in events:
            event = Event()
            event.add("uid", f"{uuid.uuid4()}@pebble")
            event.add("dtstamp", stamp)
            event.add("dtstart", item.start.astimezone(UTC))
            event.add("dtend", item.end.astimezone(UTC))
            event.add("summary", item.title)
            event.add("description", item.description)
            calendar.add_component(event)
        return calendar.to_ical()
