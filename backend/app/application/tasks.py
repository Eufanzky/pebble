"""Task use cases: the user's list, the steps a task is broken into, and ticking them off."""

import uuid
from collections.abc import Callable, Sequence
from dataclasses import dataclass, replace
from typing import Any

from app.application.ports.tasks import TaskRepository
from app.application.progress import ProgressLog
from app.domain.tasks import Step, Task, TaskStep

EDITABLE_FIELDS = frozenset({"title", "time_estimate", "tag", "priority", "completed", "why"})


class TaskOrderError(Exception):
    """The order sent doesn't list exactly the user's tasks (one changed meanwhile, or an id isn't theirs)."""

    def __init__(self) -> None:
        super().__init__("Your list changed meanwhile. Pebble kept the order it had.")


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
    progress: ProgressLog | None = None
    """Notes each task and step the first time it's finished (5.6)."""

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
        before = await self._get(user_id, task_id)
        task = replace(before, **changes)
        await self._save(user_id, task)
        await self._finished(user_id, before, task)
        return task

    async def set_steps(self, user_id: str, task_id: str, steps: Sequence[Step]) -> Task:
        """Replace a task's steps, for example with a new CalmSense breakdown. The new steps start open."""
        new_steps = tuple(TaskStep(self.make_id(), s.title, s.time_estimate) for s in steps)
        task = (await self._get(user_id, task_id)).with_steps(new_steps)
        await self._save(user_id, task)
        return task

    async def set_breakdown(self, user_id: str, task_id: str, steps: Sequence[Step], why: str) -> Task:
        """A CalmSense breakdown: its steps replace the task's (all open), and its "why" becomes the task's."""
        new_steps = tuple(TaskStep(self.make_id(), s.title, s.time_estimate) for s in steps)
        task = replace((await self._get(user_id, task_id)).with_steps(new_steps), why=why)
        await self._save(user_id, task)
        return task

    async def remove_breakdown(self, user_id: str, task_id: str) -> Task:
        """Undo or dismiss a breakdown (7.5): the steps and the "why" go; everything else about the task stays."""
        return await self.set_breakdown(user_id, task_id, (), "")

    async def get(self, user_id: str, task_id: str) -> Task:
        return await self._get(user_id, task_id)

    async def set_step_completed(self, user_id: str, task_id: str, step_id: str, completed: bool) -> Task:
        before = await self._get(user_id, task_id)
        try:
            task = before.with_step_completed(step_id, completed)
        except KeyError:
            raise TaskNotFoundError() from None
        await self._save(user_id, task)
        await self._finished(user_id, before, task)
        return task

    async def delete(self, user_id: str, task_id: str) -> None:
        if not await self.repository.delete(user_id, task_id):
            raise TaskNotFoundError()

    async def reorder(self, user_id: str, task_ids: Sequence[str]) -> "list[Task]":
        """Put the user's tasks in the order given; every task must be listed exactly once."""
        if len(set(task_ids)) != len(task_ids):
            raise TaskOrderError()
        try:
            await self.repository.reorder(user_id, task_ids)
        except KeyError:
            raise TaskOrderError() from None
        return await self.repository.list(user_id)

    async def clear(self, user_id: str) -> None:
        await self.repository.delete_all(user_id)

    async def _finished(self, user_id: str, before: Task, after: Task) -> None:
        if self.progress is not None:
            await self.progress.finished(user_id, before, after)

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
