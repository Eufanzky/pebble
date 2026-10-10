"""The sliding window behind the per-user agent limit (10.4)."""

from datetime import UTC, datetime, timedelta

from app.domain.rate_limit import RateLimit, wait_before_next_call

NOW = datetime(2026, 10, 10, 12, 0, tzinfo=UTC)
PER_MINUTE = RateLimit(3, timedelta(minutes=1))


def ago(seconds: float) -> datetime:
    return NOW - timedelta(seconds=seconds)


def test_under_the_limit_a_call_fits_now():
    assert wait_before_next_call([], NOW, [PER_MINUTE]) is None
    assert wait_before_next_call([ago(30), ago(10)], NOW, [PER_MINUTE]) is None


def test_at_the_limit_it_waits_until_the_oldest_call_in_the_window_is_a_minute_old():
    assert wait_before_next_call([ago(50), ago(20), ago(5)], NOW, [PER_MINUTE]) == timedelta(seconds=10)


def test_calls_older_than_the_window_no_longer_count():
    assert wait_before_next_call([ago(300), ago(61), ago(20), ago(5)], NOW, [PER_MINUTE]) is None


def test_a_call_exactly_a_window_old_has_left_it():
    assert wait_before_next_call([ago(60), ago(20), ago(5)], NOW, [PER_MINUTE]) is None


def test_with_more_calls_than_the_limit_it_waits_for_enough_of_them_to_leave():
    # 4 calls in the minute (a limit lowered meanwhile): two must leave, so the second-oldest decides
    calls = [ago(55), ago(40), ago(20), ago(5)]
    assert wait_before_next_call(calls, NOW, [PER_MINUTE]) == timedelta(seconds=20)


def test_every_limit_must_fit_and_the_longest_wait_wins():
    per_day = RateLimit(4, timedelta(days=1))
    calls = [ago(3600 * 5), ago(3600), ago(50), ago(20)]

    assert wait_before_next_call(calls, NOW, [PER_MINUTE]) is None
    assert wait_before_next_call(calls, NOW, [PER_MINUTE, per_day]) == timedelta(hours=19)
