"""Tasks and the steps CalmSense breaks them into."""

from collections.abc import Callable
from dataclasses import dataclass


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
