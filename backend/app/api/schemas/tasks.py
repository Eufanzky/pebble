from pydantic import BaseModel, Field

from app.domain.tasks import TaskPriority, TaskTag

TITLE = Field(min_length=1, max_length=500)
TIME_ESTIMATE = Field(alias="timeEstimate", default="", max_length=50)


class SubtaskIn(BaseModel):
    title: str = TITLE
    time_estimate: str = TIME_ESTIMATE
    completed: bool = False

    model_config = {"populate_by_name": True}


class TaskCreate(BaseModel):
    title: str = TITLE
    time_estimate: str = TIME_ESTIMATE
    tag: TaskTag = TaskTag.PROJECT
    priority: TaskPriority = TaskPriority.MEDIUM
    completed: bool = False
    why_explanation: str = Field(alias="whyExplanation", default="", max_length=5000)
    subtasks: list[SubtaskIn] = Field(default_factory=list, max_length=50)

    model_config = {"populate_by_name": True}


class TaskUpdate(BaseModel):
    """Only the fields sent are changed."""

    title: str | None = Field(default=None, min_length=1, max_length=500)
    time_estimate: str | None = Field(alias="timeEstimate", default=None, max_length=50)
    tag: TaskTag | None = None
    priority: TaskPriority | None = None
    completed: bool | None = None
    why_explanation: str | None = Field(alias="whyExplanation", default=None, max_length=5000)

    model_config = {"populate_by_name": True}


class SubtasksReplace(BaseModel):
    subtasks: list[SubtaskIn] = Field(max_length=50)


class SubtaskUpdate(BaseModel):
    completed: bool


class SubtaskOut(BaseModel):
    id: str
    title: str
    time_estimate: str = Field(alias="timeEstimate")
    completed: bool

    model_config = {"populate_by_name": True, "by_alias": True}


class TaskOut(BaseModel):
    id: str
    title: str
    time_estimate: str = Field(alias="timeEstimate")
    tag: TaskTag
    priority: TaskPriority
    completed: bool
    why_explanation: str = Field(alias="whyExplanation")
    subtasks: list[SubtaskOut]

    model_config = {"populate_by_name": True, "by_alias": True}
