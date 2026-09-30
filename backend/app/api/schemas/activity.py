from datetime import datetime

from pydantic import BaseModel, Field

from app.domain.activity import SafetyStatus
from app.domain.agents import AgentName


class ActivityEntryIn(BaseModel):
    """Something the user did that Pebble reacted to (the agents log their own results)."""

    agent: AgentName
    action: str = Field(min_length=1, max_length=500)
    reasoning: str = Field(default="", max_length=2000)
    safety_status: SafetyStatus = Field(alias="safetyStatus", default=SafetyStatus.PASSED)

    model_config = {"populate_by_name": True}


class ActivityEntryOut(BaseModel):
    id: str
    timestamp: datetime
    agent: AgentName
    action: str
    reasoning: str
    safety_status: SafetyStatus = Field(alias="safetyStatus")

    model_config = {"populate_by_name": True, "by_alias": True}
