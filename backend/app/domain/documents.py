"""Documents as SimplifyCore sees them: a simpler version and the action items in it."""

from collections.abc import Callable
from dataclasses import dataclass, field

from app.domain.safety import Groundedness
from app.domain.tasks import TaskTag


@dataclass(frozen=True)
class ExtractedTask:
    title: str
    time_estimate: str = ""
    tag: TaskTag = TaskTag.PROJECT


@dataclass(frozen=True)
class Simplification:
    simplified: str
    extracted_tasks: tuple[ExtractedTask, ...] = ()
    tags: tuple[str, ...] = ()
    why: str = ""
    groundedness: Groundedness = field(default_factory=Groundedness)

    def texts(self) -> list[str]:
        """Every user-visible text, for safety checks."""
        return [self.simplified, *(t.title for t in self.extracted_tasks), *self.tags, self.why]

    def map_text(self, transform: Callable[[str], str]) -> "Simplification":
        return Simplification(
            simplified=transform(self.simplified),
            extracted_tasks=tuple(
                ExtractedTask(transform(t.title), t.time_estimate, t.tag) for t in self.extracted_tasks
            ),
            tags=tuple(map(transform, self.tags)),
            why=transform(self.why),
            groundedness=self.groundedness,
        )
