"""The activity log: what each agent did for the user, and why. Every AI action is explainable."""

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum

from app.domain.agents import AgentName


class SafetyStatus(StrEnum):
    PASSED = "passed"
    FLAGGED = "flagged"


@dataclass(frozen=True)
class ActivityEntry:
    id: str
    timestamp: datetime
    agent: AgentName
    action: str
    reasoning: str
    safety_status: SafetyStatus = SafetyStatus.PASSED
