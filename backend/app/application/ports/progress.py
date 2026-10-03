"""The progress store: events that are only ever added."""

from typing import Protocol

from app.domain.progress import ProgressEvent


class ProgressRepository(Protocol):
    async def add(self, user_id: str, event: ProgressEvent) -> bool:
        """Store the event, unless one of the same kind for the same item is already there. True if stored."""
        ...

    async def list(self, user_id: str) -> list[ProgressEvent]:
        """All of the user's events, oldest first."""
        ...
