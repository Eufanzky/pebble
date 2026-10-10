"""``AgentCallLimit``: counting each user's agent calls in memory (10.4)."""

from datetime import UTC, datetime, timedelta

import pytest

from app.application.errors import AgentCallsLimitedError
from app.application.rate_limit import AgentCallLimit
from app.domain.rate_limit import RateLimit


class Clock:
    def __init__(self) -> None:
        self.now = datetime(2026, 10, 10, 12, 0, tzinfo=UTC)

    def __call__(self) -> datetime:
        return self.now

    def advance(self, **delta: float) -> None:
        self.now += timedelta(**delta)


@pytest.fixture
def clock() -> Clock:
    return Clock()


def test_calls_up_to_the_limit_pass_and_the_next_one_says_when_to_come_back(clock):
    limit = AgentCallLimit([RateLimit(2, timedelta(minutes=1))], clock)
    limit.take("u")
    clock.advance(seconds=15)
    limit.take("u")

    with pytest.raises(AgentCallsLimitedError) as raised:
        limit.take("u")
    assert raised.value.retry_after == 45


def test_a_refused_call_doesnt_count(clock):
    limit = AgentCallLimit([RateLimit(1, timedelta(minutes=1))], clock)
    limit.take("u")
    for _ in range(5):
        with pytest.raises(AgentCallsLimitedError):
            limit.take("u")

    clock.advance(minutes=1)
    limit.take("u")  # the refusals didn't push it back


def test_each_user_has_their_own_count(clock):
    limit = AgentCallLimit([RateLimit(1, timedelta(minutes=1))], clock)
    limit.take("u")

    limit.take("someone else")
    with pytest.raises(AgentCallsLimitedError):
        limit.take("u")


def test_the_day_limit_holds_after_the_minute_one_frees_up(clock):
    limit = AgentCallLimit([RateLimit(2, timedelta(minutes=1)), RateLimit(3, timedelta(days=1))], clock)
    for _ in range(3):
        limit.take("u")
        clock.advance(minutes=2)

    with pytest.raises(AgentCallsLimitedError) as raised:
        limit.take("u")
    assert raised.value.retry_after == int(timedelta(days=1).total_seconds()) - 6 * 60

    clock.advance(days=1)
    limit.take("u")


def test_a_fraction_of_a_second_rounds_up(clock):
    limit = AgentCallLimit([RateLimit(1, timedelta(minutes=1))], clock)
    limit.take("u")
    clock.advance(seconds=59.5)

    with pytest.raises(AgentCallsLimitedError) as raised:
        limit.take("u")
    assert raised.value.retry_after == 1


def test_no_limits_or_a_zero_limit_never_refuses(clock):
    for limit in (AgentCallLimit(clock=clock), AgentCallLimit([RateLimit(0, timedelta(minutes=1))], clock)):
        for _ in range(100):
            limit.take("u")
