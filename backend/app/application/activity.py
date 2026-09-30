"""The activity log use cases: what the agents did, and what the user did that Pebble reacted to."""

import logging
import uuid
from collections.abc import AsyncIterator, Callable
from contextlib import asynccontextmanager
from dataclasses import dataclass
from datetime import UTC, datetime

from app.application.errors import PromptAttackError, UnsafeContentError, UnsafeOutputError
from app.application.ports.activity import ActivityRepository
from app.application.ports.persistence import PersistenceError
from app.domain.activity import ActivityEntry, SafetyStatus
from app.domain.agents import AgentName

logger = logging.getLogger("pebble.activity")

MAX_LIMIT = 200


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass
class ActivityLog:
    repository: ActivityRepository
    clock: Callable[[], datetime] = utc_now
    make_id: Callable[[], str] = lambda: str(uuid.uuid4())

    async def recent(self, user_id: str, limit: int = 50) -> list[ActivityEntry]:
        return await self.repository.recent(user_id, max(1, min(limit, MAX_LIMIT)))

    async def record(
        self,
        user_id: str,
        agent: AgentName,
        action: str,
        reasoning: str,
        safety_status: SafetyStatus = SafetyStatus.PASSED,
    ) -> ActivityEntry:
        entry = ActivityEntry(self.make_id(), self.clock(), agent, action, reasoning, safety_status)
        await self.repository.add(user_id, entry)
        return entry

    async def note(
        self,
        user_id: str,
        agent: AgentName,
        action: str,
        reasoning: str,
        safety_status: SafetyStatus = SafetyStatus.PASSED,
    ) -> None:
        """``record`` for the agent pipeline: a log that can't be written never costs the user their answer."""
        try:
            await self.record(user_id, agent, action, reasoning, safety_status)
        except PersistenceError as exc:
            logger.warning("Activity entry not saved: %s", exc)


HELD_BACK = {
    PromptAttackError: (
        "A message was held back",
        "Prompt Shields saw an attempt to change Pebble's instructions, so no agent ran.",
    ),
    UnsafeContentError: ("A message was held back", "Content Safety flagged the message, so no agent ran."),
    UnsafeOutputError: ("A reply was held back", "Content Safety flagged the agent's reply, so Pebble didn't show it."),
}


def quote(text: str, limit: int = 50) -> str:
    """A short, quoted excerpt of (already redacted) user text."""
    text = " ".join(text.split())
    return f'"{text if len(text) <= limit else text[: limit - 1].rstrip() + "…"}"'


async def note(
    activity: ActivityLog | None,
    user_id: str,
    agent: AgentName,
    action: str,
    reasoning: str,
    safety_status: SafetyStatus = SafetyStatus.PASSED,
) -> None:
    """Write an entry when there is a log and a user to write it for."""
    if activity is not None and user_id:
        await activity.note(user_id, agent, action, reasoning, safety_status)


@asynccontextmanager
async def watch(activity: ActivityLog | None, user_id: str, agent: AgentName) -> AsyncIterator[None]:
    """Log a held-back input or reply as a flagged entry, then let the error through. Never logs the text."""
    try:
        yield
    except (PromptAttackError, UnsafeContentError, UnsafeOutputError) as exc:
        action, reasoning = HELD_BACK[type(exc)]
        await note(activity, user_id, agent, action, reasoning, SafetyStatus.FLAGGED)
        raise
