"""Tasks and the steps CalmSense breaks them into."""

from collections.abc import Callable
from dataclasses import dataclass, replace
from enum import StrEnum


class TaskTag(StrEnum):
    STUDY = "study"
    COMMUNICATION = "communication"
    PROJECT = "project"
    WELLBEING = "wellbeing"

    @classmethod
    def parse(cls, value: object) -> "TaskTag":
        """An unknown tag is a project: the UI can only show these four."""
        try:
            return cls(value)
        except ValueError:
            return cls.PROJECT


@dataclass(frozen=True)
class Step:
    title: str
    time_estimate: str = ""


@dataclass(frozen=True)
class TaskBreakdown:
    steps: tuple[Step, ...]
    why: str = ""

    def texts(self) -> list[str]:
        """Every user-visible text, for safety checks."""
        return [step.title for step in self.steps] + [self.why]

    def map_text(self, transform: Callable[[str], str]) -> "TaskBreakdown":
        return TaskBreakdown(
            steps=tuple(Step(transform(s.title), s.time_estimate) for s in self.steps),
            why=transform(self.why),
        )


class TaskPriority(StrEnum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


@dataclass(frozen=True)
class TaskStep:
    """One step of a saved task, as the user ticks it off."""

    id: str
    title: str
    time_estimate: str = ""
    completed: bool = False


@dataclass(frozen=True)
class Task:
    """A task on the user's list, with the steps it was broken into."""

    id: str
    title: str
    time_estimate: str = ""
    tag: TaskTag = TaskTag.PROJECT
    priority: TaskPriority = TaskPriority.MEDIUM
    completed: bool = False
    why: str = ""
    steps: tuple[TaskStep, ...] = ()

    def with_steps(self, steps: tuple[TaskStep, ...]) -> "Task":
        """New steps replace the old ones; the task stays as done or open as it was."""
        return replace(self, steps=steps)

    def with_step_completed(self, step_id: str, completed: bool) -> "Task":
        """Tick a step on or off. Finishing the last open step finishes the task; unticking never reopens it.

        Raises ``KeyError`` for a step the task doesn't have.
        """
        if not any(step.id == step_id for step in self.steps):
            raise KeyError(step_id)
        steps = tuple(replace(s, completed=completed) if s.id == step_id else s for s in self.steps)
        return replace(self, steps=steps, completed=self.completed or all(s.completed for s in steps))
