from datetime import datetime

from pydantic import BaseModel, Field

from app.api.schemas.activity import ActivityEntryIn
from app.api.schemas.preferences import PreferencesUpdate
from app.api.schemas.tasks import TaskCreate


class ImportedActivityEntry(ActivityEntryIn):
    timestamp: datetime


class ImportRequest(BaseModel):
    """What the browser kept before sign-in (roadmap 4.5)."""

    tasks: list[TaskCreate] = Field(default_factory=list, max_length=500)
    preferences: PreferencesUpdate | None = None
    activity: list[ImportedActivityEntry] = Field(default_factory=list, max_length=1000)


class ImportResponse(BaseModel):
    tasks: int
    preferences: bool
    activity: int
