"""The activity log store."""

from typing import Protocol

from app.domain.activity import ActivityEntry


class ActivityRepository(Protocol):
    async def add(self, user_id: str, entry: ActivityEntry) -> None: ...

    async def recent(self, user_id: str, limit: int) -> list[ActivityEntry]:
        """The user's newest entries first, at most ``limit``."""
        ...
