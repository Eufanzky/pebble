from datetime import UTC, date, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from app.domain.progress import ProgressEvent, ProgressKind, Totals, summarize
from app.domain.tasks import TaskTag

BERLIN = ZoneInfo("Europe/Berlin")


def at(day: int, hour: int = 12) -> datetime:
    return datetime(2026, 10, day, hour, tzinfo=UTC)


def task(day: int, tag: TaskTag = TaskTag.STUDY, hour: int = 12) -> ProgressEvent:
    return ProgressEvent(ProgressKind.TASK, f"t{day}{hour}{tag}", at(day, hour), tag=tag)


def step(day: int) -> ProgressEvent:
    return ProgressEvent(ProgressKind.STEP, f"s{day}", at(day), tag=TaskTag.STUDY)


def focus(day: int, minutes: int = 25) -> ProgressEvent:
    return ProgressEvent(ProgressKind.FOCUS, f"f{day}", at(day), minutes=minutes)


def test_counts_within_the_range_and_all_time():
    events = [task(1), step(5), task(6, TaskTag.WELLBEING), focus(6), focus(7, 15)]

    summary = summarize(events, today=date(2026, 10, 7), days=3, tz=UTC)

    assert (summary.start, summary.end) == (date(2026, 10, 5), date(2026, 10, 7))
    assert summary.totals == Totals(tasks=1, steps=1, focus_minutes=40)
    assert summary.all_time == Totals(tasks=2, steps=1, focus_minutes=40)
    assert summary.by_tag[TaskTag.WELLBEING] == 1
    assert summary.by_tag[TaskTag.STUDY] == 0


def test_every_day_is_there_and_a_quiet_day_is_just_zero():
    summary = summarize([step(5)], today=date(2026, 10, 7), days=3, tz=UTC)

    assert [d.day for d in summary.days] == [date(2026, 10, 5), date(2026, 10, 6), date(2026, 10, 7)]
    assert [d.totals for d in summary.days] == [Totals(steps=1), Totals(), Totals()]


def test_days_are_the_users_own():
    """23:30 UTC on the 5th is already the 6th in Berlin."""
    late = ProgressEvent(ProgressKind.STEP, "s", datetime(2026, 10, 5, 23, 30, tzinfo=UTC))

    in_utc = summarize([late], today=date(2026, 10, 6), days=2, tz=UTC)
    in_berlin = summarize([late], today=date(2026, 10, 6), days=2, tz=BERLIN)

    assert [d.totals.steps for d in in_utc.days] == [1, 0]
    assert [d.totals.steps for d in in_berlin.days] == [0, 1]


@pytest.mark.parametrize("gap", [0, 1, 3, 40, 400])
def test_all_time_counts_never_go_down_across_gaps_of_days(gap):
    """Principle 1: coming back after any time away, nothing finished has been taken away."""
    events = [task(1), step(2), focus(3)]
    before = summarize(events, today=date(2026, 10, 3), days=7, tz=UTC).all_time

    later = date(2026, 10, 3) + timedelta(days=gap)
    after = summarize(events, today=later, days=7, tz=UTC).all_time

    assert after == before
    assert (after.tasks, after.steps, after.focus_minutes) >= (before.tasks, before.steps, before.focus_minutes)


def test_more_events_only_ever_add():
    events = [task(1), step(2)]
    one = summarize(events, today=date(2026, 10, 7), days=30, tz=UTC)
    two = summarize([*events, task(7)], today=date(2026, 10, 7), days=30, tz=UTC)

    assert two.all_time.tasks == one.all_time.tasks + 1
    assert two.totals.steps == one.totals.steps
