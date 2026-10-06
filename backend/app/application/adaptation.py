"""AdaptLens use cases: noting usage signals, and suggesting preference changes the user approves (7.6)."""

import logging
from collections.abc import Callable
from dataclasses import dataclass
from datetime import UTC, datetime

from app.application.activity import ActivityLog, note
from app.application.agents.whybot import Explain, explain
from app.application.ports.adaptation import AdaptationRepository
from app.application.ports.persistence import PersistenceError
from app.application.preferences import UserPreferences
from app.domain.adaptation import Signal, SignalKind, Suggestion, still_quiet, suggest
from app.domain.agents import AgentName
from app.domain.preferences import Preferences
from app.domain.tasks import Task

logger = logging.getLogger("pebble.adaptlens")

RECENT = 50
LABELS = {"reading_level": "reading level", "step_size": "step size"}


class SuggestionGoneError(Exception):
    """The suggestion the user answered isn't the current one any more (it was applied or changed meanwhile)."""

    def __init__(self) -> None:
        super().__init__("That suggestion has changed meanwhile. Nothing was changed.")


def utc_now() -> datetime:
    return datetime.now(UTC)


@dataclass
class UsageSignals:
    """Notes what AdaptLens learns from. A signal that can't be saved never costs the user their action."""

    repository: AdaptationRepository
    clock: Callable[[], datetime] = utc_now

    async def note(self, user_id: str, kind: SignalKind, value: int) -> None:
        if not user_id:
            return
        try:
            await self.repository.add_signal(user_id, Signal(kind, value, self.clock()))
        except PersistenceError as exc:
            logger.warning("Usage signal not saved: %s", exc)

    async def task_finished(self, user_id: str, before: Task, after: Task) -> None:
        """A task with steps was just finished: note how many of its steps were still open."""
        if before.completed or not after.completed or not after.steps:
            return
        still_open = sum(1 for s in after.steps if not s.completed)
        await self.note(user_id, SignalKind.TASK_FINISHED, round(100 * still_open / len(after.steps)))


@dataclass
class AdaptLens:
    repository: AdaptationRepository
    preferences: UserPreferences
    activity: ActivityLog | None = None
    whybot: Explain | None = None
    clock: Callable[[], datetime] = utc_now

    async def current(self, user_id: str) -> Suggestion | None:
        """The one suggestion worth making now, if any. Nothing changes until the user accepts it."""
        now = self.clock()
        quiet = {key for key, at in (await self.repository.dismissals(user_id)).items() if still_quiet(at, now)}
        signals = await self.repository.recent_signals(user_id, RECENT)
        return suggest(signals, await self.preferences.get(user_id), quiet)

    async def accept(self, user_id: str, key: str) -> Preferences:
        """Apply the current suggestion ``key``. If it isn't the current one any more, nothing changes."""
        suggestion = await self.current(user_id)
        if suggestion is None or suggestion.key != key:
            raise SuggestionGoneError()
        preferences = await self.preferences.update(user_id, {suggestion.preference: suggestion.value})
        label = LABELS.get(suggestion.preference, suggestion.preference)
        why = await explain(
            self.whybot,
            AgentName.ADAPT_LENS,
            f"to change the default {label} to {suggestion.value}",
            f"Suggested it, and you accepted. What it noticed: {suggestion.reason}",
            f"{label} was the default before",
            suggestion.reason,
        )
        await note(
            self.activity,
            user_id,
            AgentName.ADAPT_LENS,
            f"Set your default {label} to {suggestion.value}, as you accepted",
            suggestion.reason,
            explanation=why,
        )
        return preferences

    async def dismiss(self, user_id: str, key: str) -> None:
        """Not now: this suggestion stays away for a while (``QUIET_AFTER_DISMISS``)."""
        await self.repository.dismiss(user_id, key, self.clock())
