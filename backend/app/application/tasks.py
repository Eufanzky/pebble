"""Task use cases: the user's list, the steps a task is broken into, and ticking them off."""

import uuid
from collections.abc import Callable, Sequence
from dataclasses import dataclass, replace
from typing import Any

from app.application.ports.tasks import TaskRepository
from app.domain.tasks import Step, Task, TaskStep

EDITABLE_FIELDS = frozenset({"title", "time_estimate", "tag", "priority", "completed", "why"})


class TaskNotFoundError(Exception):
    """No such task (or step) for this user. Someone else's task is reported the same way."""

    def __init__(self) -> None:
        super().__init__("Pebble couldn't find that on your list.")


def new_id() -> str:
    return str(uuid.uuid4())


@dataclass
class Tasks:
    repository: TaskRepository
    make_id: Callable[[], str] = new_id

    async def list(self, user_id: str) -> list[Task]:
        return await self.repository.list(user_id)

    async def add(self, user_id: str, task: Task) -> Task:
        """Store a new task. Its id, and its steps' ids, are chosen here."""
        task = replace(task, id=self.make_id(), steps=tuple(replace(s, id=self.make_id()) for s in task.steps))
        await self.repository.add(user_id, task)
        return task

    async def update(self, user_id: str, task_id: str, changes: dict[str, Any]) -> Task:
        unknown = set(changes) - EDITABLE_FIELDS
        if unknown:
            raise ValueError(f"Not editable: {sorted(unknown)}")
        task = replace(await self._get(user_id, task_id), **changes)
        await self._save(user_id, task)
        return task

    async def set_steps(self, user_id: str, task_id: str, steps: Sequence[Step]) -> Task:
        """Replace a task's steps, for example with a new CalmSense breakdown. The new steps start open."""
        new_steps = tuple(TaskStep(self.make_id(), s.title, s.time_estimate) for s in steps)
        task = (await self._get(user_id, task_id)).with_steps(new_steps)
        await self._save(user_id, task)
        return task

    async def set_step_completed(self, user_id: str, task_id: str, step_id: str, completed: bool) -> Task:
        try:
            task = (await self._get(user_id, task_id)).with_step_completed(step_id, completed)
        except KeyError:
            raise TaskNotFoundError() from None
        await self._save(user_id, task)
        return task

    async def delete(self, user_id: str, task_id: str) -> None:
        if not await self.repository.delete(user_id, task_id):
            raise TaskNotFoundError()

    async def clear(self, user_id: str) -> None:
        await self.repository.delete_all(user_id)

    async def _get(self, user_id: str, task_id: str) -> Task:
        task = await self.repository.get(user_id, task_id)
        if task is None:
            raise TaskNotFoundError()
        return task

    async def _save(self, user_id: str, task: Task) -> None:
        try:
            await self.repository.save(user_id, task)
        except KeyError:
            raise TaskNotFoundError() from None
