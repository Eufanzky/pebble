
from pydantic import BaseModel, Field

# --- Task Decomposition ---

class DecomposeRequest(BaseModel):
    task_title: str = Field(alias="taskTitle", min_length=1)
    step_size: str = Field(alias="stepSize", default="medium")
    time_of_day: str = Field(alias="timeOfDay", default="day")

    model_config = {"populate_by_name": True}


class StepResult(BaseModel):
    title: str
    time_estimate: str = Field(alias="timeEstimate")

    model_config = {"populate_by_name": True, "by_alias": True}


class DecomposeResponse(BaseModel):
    steps: list[StepResult]
    why_explanation: str = Field(alias="whyExplanation")

    model_config = {"populate_by_name": True, "by_alias": True}


# --- Document Simplification ---

class SimplifyRequest(BaseModel):
    text: str = Field(min_length=1)
    reading_level: int = Field(alias="readingLevel", default=5, ge=1, le=10)

    model_config = {"populate_by_name": True}


class ExtractedTask(BaseModel):
    title: str
    time_estimate: str = Field(alias="timeEstimate")
    tag: str

    model_config = {"populate_by_name": True, "by_alias": True}


class GroundednessResult(BaseModel):
    grounded: bool
    ungrounded_percentage: float = Field(alias="ungroundedPercentage")

    model_config = {"populate_by_name": True, "by_alias": True}


class SimplifyResponse(BaseModel):
    simplified: str
    extracted_tasks: list[ExtractedTask] = Field(alias="extractedTasks")
    tags: list[str]
    why_explanation: str = Field(alias="whyExplanation")
    groundedness: GroundednessResult

    model_config = {"populate_by_name": True, "by_alias": True}


# --- Motivation ---

class MotivateRequest(BaseModel):
    tasks_completed: int = Field(alias="tasksCompleted", default=0)
    tasks_total: int = Field(alias="tasksTotal", default=0)
    recent_task_titles: list[str] = Field(alias="recentTaskTitles", default=[])
    time_of_day: str = Field(alias="timeOfDay", default="day")
    personality: str = "gentle"

    model_config = {"populate_by_name": True}


class MotivateResponse(BaseModel):
    message: str
    mood: str

    model_config = {"by_alias": True}


# --- Orchestrator (Chat) ---

class ChatRequest(BaseModel):
    message: str = Field(min_length=1)
    tasks_completed: int = Field(alias="tasksCompleted", default=0)
    tasks_total: int = Field(alias="tasksTotal", default=0)
    recent_task_titles: list[str] = Field(alias="recentTaskTitles", default=[])
    step_size: str = Field(alias="stepSize", default="medium")
    reading_level: int = Field(alias="readingLevel", default=5, ge=1, le=10)
    time_of_day: str = Field(alias="timeOfDay", default="day")
    personality: str = "gentle"

    model_config = {"populate_by_name": True}


class ChatResponse(BaseModel):
    intent: str
    response: str
    mood: str
    agent_name: str = Field(alias="agentName")
    data: dict | None = None

    model_config = {"populate_by_name": True, "by_alias": True}
