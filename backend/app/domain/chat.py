"""A chat turn: what Pebble knows about the user's day, and what it answers."""

from dataclasses import dataclass, field

from app.domain.activity import SafetyStatus
from app.domain.agents import AgentName, Intent, Mood


@dataclass(frozen=True)
class ChatContext:
    tasks_completed: int = 0
    tasks_total: int = 0
    recent_task_titles: tuple[str, ...] = field(default_factory=tuple)
    chunk_size: str = "medium"
    reading_level: int = 5
    time_of_day: str = "day"
    personality: str = "gentle"


@dataclass(frozen=True)
class ChatReply:
    intent: Intent
    response: str
    mood: Mood
    agent: AgentName
    data: object | None = None
    """The sub-agent's structured result (a ``TaskBreakdown``, a simplification), or None."""
    safety: SafetyStatus = SafetyStatus.PASSED
    """FLAGGED when a reply was replaced with a safe one."""


@dataclass(frozen=True)
class Encouragement:
    message: str
    mood: Mood = Mood.NORMAL
