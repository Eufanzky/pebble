from pydantic import BaseModel, Field

from app.domain.tasks import TaskPriority, TaskTag

TITLE = Field(min_length=1, max_length=500)
TIME_ESTIMATE = Field(alias="timeEstimate", default="", max_length=50)


class StepIn(BaseModel):
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
    steps: list[StepIn] = Field(default_factory=list, max_length=50)

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


class StepsReplace(BaseModel):
    steps: list[StepIn] = Field(max_length=50)


class StepUpdate(BaseModel):
    completed: bool


class StepOut(BaseModel):
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
    steps: list[StepOut]

    model_config = {"populate_by_name": True, "by_alias": True}


class TasksOrder(BaseModel):
    """Every task on the list, in the new order."""

    task_ids: list[str] = Field(alias="taskIds", max_length=1000)

    model_config = {"populate_by_name": True}
