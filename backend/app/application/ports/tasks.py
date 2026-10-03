"""The task store: each user's tasks and their steps."""

from collections.abc import Sequence
from typing import Protocol

from app.domain.tasks import Task


class TaskRepository(Protocol):
    """Every method is scoped to one user: a task that belongs to someone else doesn't exist."""

    async def list(self, user_id: str) -> list[Task]:
        """The user's tasks in their order. A new task goes last."""
        ...

    async def get(self, user_id: str, task_id: str) -> Task | None: ...

    async def add(self, user_id: str, task: Task) -> None: ...

    async def save(self, user_id: str, task: Task) -> None:
        """Store a changed task, its steps included. Raises ``KeyError`` if the user has no such task."""
        ...

    async def delete(self, user_id: str, task_id: str) -> bool:
        """Remove one task. False if the user has no such task."""
        ...

    async def delete_all(self, user_id: str) -> None: ...

    async def reorder(self, user_id: str, task_ids: Sequence[str]) -> None:
        """Put the user's tasks in this order. Raises ``KeyError`` unless ``task_ids`` are exactly their tasks."""
        ...
