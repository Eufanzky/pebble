"""BridgeBot's plan: open steps back to back, each as long as its estimate (7.7)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.domain.calendar import CalendarEvent, minutes_of, plan
from app.domain.tasks import Task, TaskStep

START = datetime(2026, 10, 6, 9, tzinfo=UTC)


@pytest.mark.parametrize(
    ("estimate", "minutes"),
    [
        ("~25 min", 25),
        ("10 min", 10),
        ("1 h", 60),
        ("1.5 hours", 90),
        ("2 hr", 120),
        ("", 15),
        ("soon", 15),
        ("900 min", 240),
    ],
)
def test_minutes_from_an_estimate(estimate, minutes):
    assert minutes_of(estimate) == minutes


def test_open_steps_go_back_to_back_and_done_ones_are_left_out():
    task = Task(
        "t",
        "Essay",
        steps=(
            TaskStep("a", "Outline", "~10 min", completed=True),
            TaskStep("b", "Draft", "~25 min"),
            TaskStep("c", "Read it"),
        ),
    )

    events = plan(task, START)

    note = 'A step of "Essay", planned by Pebble.'
    assert events == [
        CalendarEvent("Draft", START, START + timedelta(minutes=25), note),
        CalendarEvent("Read it", START + timedelta(minutes=25), START + timedelta(minutes=40), note),
    ]


def test_a_task_without_open_steps_is_one_event():
    assert plan(Task("t", "Walk", time_estimate="~30 min"), START) == [
        CalendarEvent("Walk", START, START + timedelta(minutes=30), "Planned by Pebble.")
    ]
