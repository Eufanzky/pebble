"""The AdaptLens store: usage signals, and which suggestions the user dismissed when (7.6)."""

from datetime import datetime
from typing import Protocol

from app.domain.adaptation import Signal


class AdaptationRepository(Protocol):
    """Every method is scoped to one user."""

    async def add_signal(self, user_id: str, signal: Signal) -> None: ...

    async def recent_signals(self, user_id: str, limit: int) -> list[Signal]:
        """The newest first."""
        ...

    async def dismiss(self, user_id: str, key: str, at: datetime) -> None:
        """Remember that the user dismissed suggestion ``key`` at ``at`` (a later dismissal replaces it)."""
        ...

    async def dismissals(self, user_id: str) -> dict[str, datetime]: ...
