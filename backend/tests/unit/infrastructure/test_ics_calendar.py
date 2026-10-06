"""The .ics file BridgeBot writes, read back by a parser: a valid calendar any app can import (7.7)."""

from datetime import UTC, datetime, timedelta

from icalendar import Calendar

from app.domain.calendar import CalendarEvent
from app.infrastructure.calendar.ics import IcsCalendarWriter

START = datetime(2026, 10, 6, 9, 15, tzinfo=UTC)
NOW = datetime(2026, 10, 6, 9, tzinfo=UTC)


def write(*events: CalendarEvent) -> Calendar:
    return Calendar.from_ical(IcsCalendarWriter(clock=lambda: NOW).write(events))


def test_the_file_is_a_valid_calendar_with_one_event_per_step():
    calendar = write(
        CalendarEvent("Draft", START, START + timedelta(minutes=25), "A step."),
        CalendarEvent("Read it", START + timedelta(minutes=25), START + timedelta(minutes=40), "A step."),
    )

    assert (str(calendar["version"]), str(calendar["prodid"])) == ("2.0", "-//Pebble//BridgeBot//EN")
    events = calendar.walk("VEVENT")
    assert [str(e["summary"]) for e in events] == ["Draft", "Read it"]
    assert [(e.decoded("dtstart"), e.decoded("dtend")) for e in events] == [
        (START, START + timedelta(minutes=25)),
        (START + timedelta(minutes=25), START + timedelta(minutes=40)),
    ]
    assert all(e.decoded("dtstamp") == NOW for e in events)
    assert len({str(e["uid"]) for e in events}) == 2


def test_times_are_written_in_utc_whatever_the_offset():
    berlin = START.astimezone(datetime.fromisoformat("2026-10-06T11:15:00+02:00").tzinfo)

    raw = IcsCalendarWriter(clock=lambda: NOW).write(
        [CalendarEvent("Draft", berlin, berlin + timedelta(minutes=10), "")]
    )

    assert b"DTSTART:20261006T091500Z" in raw
    [event] = Calendar.from_ical(raw).walk("VEVENT")
    assert event.decoded("dtstart") == START
    assert event.decoded("dtstart").utcoffset() == timedelta(0)


def test_titles_with_commas_semicolons_line_breaks_and_emoji_come_back_unchanged():
    title = "Email Sam, then Jo; and say thanks 🙂\nsecond line"

    [event] = write(CalendarEvent(title, START, START + timedelta(minutes=5), "Note, with; marks")).walk("VEVENT")

    assert str(event["summary"]) == title
    assert str(event["description"]) == "Note, with; marks"
