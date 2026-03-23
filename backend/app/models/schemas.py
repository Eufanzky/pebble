from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


# --- Enums matching frontend types ---

class TaskTag(str, Enum):
    study = "study"
    communication = "communication"
    project = "project"
    wellbeing = "wellbeing"


class Priority(str, Enum):
    high = "high"
    medium = "medium"
    low = "low"


class ChunkSize(str, Enum):
    small = "small"
    medium = "medium"
    large = "large"


class PebbleColor(str, Enum):
    lavender = "lavender"
    sage = "sage"
    coral = "coral"
    amber = "amber"
    sky = "sky"


class PebblePersonality(str, Enum):
    gentle = "gentle"
    playful = "playful"
    calm = "calm"


class PebbleModel(str, Enum):
    classic = "classic"
    chonky = "chonky"
    mochi = "mochi"
    minimal = "minimal"
    chonky_plus = "chonky-plus"
    mochi_plus = "mochi-plus"
    minimal_plus = "minimal-plus"


class AgentName(str, Enum):
    calm_sense = "CalmSense"
    adapt_lens = "AdaptLens"
    simplify_core = "SimplifyCore"
    pebble_voice = "PebbleVoice"
    why_bot = "WhyBot"
    bridge_bot = "BridgeBot"


class SafetyStatus(str, Enum):
    passed = "passed"
    flagged = "flagged"


# --- Subtask ---

class Subtask(BaseModel):
    id: str
    title: str
    time_estimate: str = Field(alias="timeEstimate", default="")
    completed: bool = False

    model_config = {"populate_by_name": True}


# --- Task ---

class TaskCreate(BaseModel):
    title: str
    time_estimate: str = Field(alias="timeEstimate", default="")
    tag: TaskTag = TaskTag.project
    priority: Priority = Priority.medium
    subtasks: list[Subtask] = []
    why_explanation: Optional[str] = Field(alias="whyExplanation", default=None)

    model_config = {"populate_by_name": True}


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    time_estimate: Optional[str] = Field(alias="timeEstimate", default=None)
    tag: Optional[TaskTag] = None
    priority: Optional[Priority] = None
    completed: Optional[bool] = None
    subtasks: Optional[list[Subtask]] = None
    show_subtasks: Optional[bool] = Field(alias="showSubtasks", default=None)
    why_explanation: Optional[str] = Field(alias="whyExplanation", default=None)

    model_config = {"populate_by_name": True}


class TaskResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    title: str
    time_estimate: str = Field(alias="timeEstimate")
    tag: TaskTag
    priority: Priority
    completed: bool
    subtasks: list[Subtask] = []
    show_subtasks: bool = Field(alias="showSubtasks", default=False)
    why_explanation: Optional[str] = Field(alias="whyExplanation", default=None)
    created_at: str = Field(alias="createdAt")
    updated_at: str = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True}


# --- Preferences ---

class PreferencesUpdate(BaseModel):
    reading_level: Optional[int] = Field(alias="readingLevel", default=None)
    chunk_size: Optional[ChunkSize] = Field(alias="chunkSize", default=None)
    reduce_animations: Optional[bool] = Field(alias="reduceAnimations", default=None)
    calm_mode: Optional[bool] = Field(alias="calmMode", default=None)
    pebble_color: Optional[PebbleColor] = Field(alias="pebbleColor", default=None)
    pebble_personality: Optional[PebblePersonality] = Field(alias="pebblePersonality", default=None)
    pebble_model: Optional[PebbleModel] = Field(alias="pebbleModel", default=None)
    voice_input: Optional[bool] = Field(alias="voiceInput", default=None)

    model_config = {"populate_by_name": True}


class PreferencesResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    reading_level: int = Field(alias="readingLevel")
    chunk_size: ChunkSize = Field(alias="chunkSize")
    reduce_animations: bool = Field(alias="reduceAnimations")
    calm_mode: bool = Field(alias="calmMode")
    pebble_color: PebbleColor = Field(alias="pebbleColor")
    pebble_personality: PebblePersonality = Field(alias="pebblePersonality")
    pebble_model: PebbleModel = Field(alias="pebbleModel")
    voice_input: bool = Field(alias="voiceInput")
    updated_at: str = Field(alias="updatedAt")

    model_config = {"populate_by_name": True, "by_alias": True}


# --- Activity ---

class ActivityCreate(BaseModel):
    agent: AgentName
    action: str
    reasoning: str
    safety_status: SafetyStatus = Field(alias="safetyStatus", default=SafetyStatus.passed)

    model_config = {"populate_by_name": True}


class ActivityResponse(BaseModel):
    id: str
    user_id: str = Field(alias="userId")
    agent: AgentName
    action: str
    reasoning: str
    safety_status: SafetyStatus = Field(alias="safetyStatus")
    timestamp: str

    model_config = {"populate_by_name": True, "by_alias": True}
