from typing import Optional

from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None


class RoomResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    created_by: str = Field(alias="createdBy")
    participant_count: int = Field(alias="participantCount", default=0)
    is_active: bool = Field(alias="isActive", default=True)
    created_at: str = Field(alias="createdAt")

    model_config = {"populate_by_name": True, "by_alias": True}


class JoinRoomResponse(BaseModel):
    room_id: str = Field(alias="roomId")
    websocket_url: str = Field(alias="websocketUrl")
    message: str

    model_config = {"populate_by_name": True, "by_alias": True}


class TimerAction(BaseModel):
    action: str = Field(pattern="^(start|pause|reset)$")


class TimerState(BaseModel):
    room_id: str = Field(alias="roomId")
    status: str  # "running" | "paused" | "idle"
    remaining_seconds: int = Field(alias="remainingSeconds")
    started_by: Optional[str] = Field(alias="startedBy", default=None)

    model_config = {"populate_by_name": True, "by_alias": True}


class FocusSessionComplete(BaseModel):
    room_id: str = Field(alias="roomId")
    duration_minutes: int = Field(alias="durationMinutes")
    message: str
    mood: str

    model_config = {"populate_by_name": True, "by_alias": True}
