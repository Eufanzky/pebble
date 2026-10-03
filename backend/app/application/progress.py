"""Recording what the user finishes, and summing it up (roadmap 5.6)."""

import logging
import uuid
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime, tzinfo

from app.application.ports.persistence import PersistenceError
from app.application.ports.progress import ProgressRepository
from app.domain.progress import ProgressEvent, ProgressKind, ProgressSummary, summarize
from app.domain.tasks import Task

logger = logging.getLogger("pebble.progress")

MAX_FOCUS_MINUTES = 180


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass
class ProgressLog:
    repository: ProgressRepository
    clock: Callable[[], datetime] = utc_now

    async def finished(self, user_id: str, before: Task | None, after: Task) -> None:
        """Note what ``after`` finished that ``before`` hadn't: the task itself, and any steps.

        A progress note that can't be written never costs the user the change itself.
        """
        now = self.clock()
        done_before = {s.id for s in before.steps if s.completed} if before else set()
        # Steps first: finishing the last step is what finishes the task
        events = [
            ProgressEvent(ProgressKind.STEP, step.id, now, tag=after.tag)
            for step in after.steps
            if step.completed and step.id not in done_before
        ]
        if after.completed and not (before and before.completed):
            events.append(ProgressEvent(ProgressKind.TASK, after.id, now, tag=after.tag))
        for event in events:
            try:
                await self.repository.add(user_id, event)
            except PersistenceError as exc:
                logger.warning("Progress not saved: %s", exc)

    async def focus(self, user_id: str, minutes: int) -> None:
        """A focus session of ``minutes`` (1 to 180) is over."""
        if not 1 <= minutes <= MAX_FOCUS_MINUTES:
            raise ValueError(f"minutes must be 1 to {MAX_FOCUS_MINUTES}")
        await self.repository.add(
            user_id, ProgressEvent(ProgressKind.FOCUS, str(uuid.uuid4()), self.clock(), minutes=minutes)
        )


@dataclass
class ProgressStats:
    repository: ProgressRepository
    clock: Callable[[], datetime] = utc_now

    async def summary(self, user_id: str, days: int, tz: tzinfo) -> ProgressSummary:
        today = self.clock().astimezone(tz).date()
        return summarize(await self.repository.list(user_id), today, days, tz)
