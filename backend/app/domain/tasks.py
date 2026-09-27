"""Tasks and the steps CalmSense breaks them into."""

from collections.abc import Callable
from dataclasses import dataclass
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
