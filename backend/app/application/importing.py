"""Moving what a browser kept before sign-in (tasks, preferences, the activity log) into the account."""

from collections.abc import Callable, Sequence
from dataclasses import dataclass, replace
from datetime import datetime
from typing import Any

from app.application.activity import ActivityLog, utc_now
from app.application.preferences import UserPreferences
from app.application.tasks import Tasks
from app.domain.activity import ActivityEntry
from app.domain.tasks import Task


@dataclass(frozen=True)
class ImportResult:
    tasks: int
    preferences: bool
    activity: int


@dataclass
class ImportLocalData:
    tasks: Tasks
    preferences: UserPreferences
    activity: ActivityLog
    clock: Callable[[], datetime] = utc_now

    async def __call__(
        self,
        user_id: str,
        tasks: Sequence[Task],
        preferences: dict[str, Any] | None,
        activity: Sequence[ActivityEntry],
    ) -> ImportResult:
        """Tasks go after the account's own, in their order. Preferences apply only to an account that
        never saved any (the account wins). Log entries keep their times, but none lands in the future."""
        for task in tasks:
            await self.tasks.add(user_id, task)

        applied = False
        if preferences and not await self.preferences.saved(user_id):
            await self.preferences.update(user_id, preferences)
            applied = True

        now = self.clock()
        for entry in sorted(activity, key=lambda e: e.timestamp):
            await self.activity.add_existing(user_id, replace(entry, timestamp=min(entry.timestamp, now)))

        return ImportResult(len(tasks), applied, len(activity))
