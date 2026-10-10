"""The per-user limit on agent calls (roadmap 10.4), kept in memory.

One process serves the API (one Render instance), so a dict of recent calls is enough. A restart
forgets them, which only ever lets a user call sooner.
"""

import math
from collections import defaultdict, deque
from collections.abc import Callable, Sequence
from datetime import datetime

from app.application.errors import AgentCallsLimitedError
from app.application.progress import utc_now
from app.domain.rate_limit import RateLimit, wait_before_next_call


class AgentCallLimit:
    def __init__(self, limits: Sequence[RateLimit] = (), clock: Callable[[], datetime] = utc_now) -> None:
        self.limits = tuple(limit for limit in limits if limit.calls > 0)
        self.clock = clock
        self._calls: defaultdict[str, deque[datetime]] = defaultdict(deque)

    def take(self, user_id: str) -> None:
        """Counts one agent call for ``user_id``, or raises ``AgentCallsLimitedError`` (and counts nothing)."""
        if not self.limits:
            return
        now = self.clock()
        calls = self._calls[user_id]
        longest = max(limit.per for limit in self.limits)
        while calls and calls[0] <= now - longest:
            calls.popleft()
        wait = wait_before_next_call(calls, now, self.limits)
        if wait is not None:
            raise AgentCallsLimitedError(retry_after=math.ceil(wait.total_seconds()))
        calls.append(now)
