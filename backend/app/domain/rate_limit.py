"""How often one user may call the agents (roadmap 10.4).

The LLM's free tier is shared by every account, so each user gets a few calls per
minute and per day. A window slides: a call counts until it's ``per`` old.
"""

from collections.abc import Sequence
from dataclasses import dataclass
from datetime import datetime, timedelta


@dataclass(frozen=True)
class RateLimit:
    """At most ``calls`` calls in any ``per``."""

    calls: int
    per: timedelta


def wait_before_next_call(calls: Sequence[datetime], now: datetime, limits: Sequence[RateLimit]) -> timedelta | None:
    """How long until one more call fits every limit, given the earlier ``calls`` (oldest first).

    None if it fits now.
    """
    wait = timedelta(0)
    for limit in limits:
        recent = [at for at in calls if at > now - limit.per]
        if len(recent) >= limit.calls:
            # The call that frees a place is the one `limit.calls` back from the newest
            frees_at = recent[len(recent) - limit.calls] + limit.per
            wait = max(wait, frees_at - now)
    return wait or None
