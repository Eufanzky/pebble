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


def test_what_today_and_activity_show_never_goes_down_over_months_of_visits():
    """8.2: a year of visits with gaps of every length. The all-time totals that Today and Activity show
    never go down, even as finished work leaves the summary's range, and a quiet stretch changes nothing."""
    gaps = [1, 1, 2, 5, 0, 13, 1, 31, 3, 90, 1, 7, 45, 1, 120, 2]
    start = datetime(2026, 1, 1, 12, tzinfo=UTC)
    events: list[ProgressEvent] = []
    shown: list[Totals] = []

    visit = start
    for i, gap in enumerate(gaps):
        visit += timedelta(days=gap)
        if i % 3 != 2:  # some visits finish nothing
            events.append(ProgressEvent(ProgressKind.STEP, f"s{i}", visit, tag=TaskTag.STUDY))
            events.append(ProgressEvent(ProgressKind.FOCUS, f"f{i}", visit, minutes=10))
        if i % 4 == 0:
            events.append(ProgressEvent(ProgressKind.TASK, f"t{i}", visit, tag=TaskTag.PROJECT))
        shown.append(summarize(events, today=visit.date(), days=1, tz=UTC).all_time)

    for earlier, later in zip(shown, shown[1:], strict=False):
        assert later.tasks >= earlier.tasks
        assert later.steps >= earlier.steps
        assert later.focus_minutes >= earlier.focus_minutes
    assert shown[-1] == Totals(tasks=4, steps=11, focus_minutes=110)
