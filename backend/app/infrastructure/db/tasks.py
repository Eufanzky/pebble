"""``TaskRepository`` on Postgres, and the stand-in used when no database is configured."""

import uuid
from collections.abc import Sequence

from sqlalchemy import delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.tasks import Task, TaskPriority, TaskStep, TaskTag
from app.infrastructure.db.engine import SqlRepository, Unconfigured
from app.infrastructure.db.models import StepRow, TaskRow


def _uuid(value: str) -> uuid.UUID | None:
    """Ids come from URLs: one that isn't a UUID matches no row."""
    try:
        return uuid.UUID(value)
    except ValueError:
        return None


def _to_domain(row: TaskRow) -> Task:
    return Task(
        id=str(row.id),
        title=row.title,
        time_estimate=row.time_estimate,
        tag=TaskTag.parse(row.tag),
        priority=TaskPriority(row.priority),
        completed=row.completed,
        why=row.why,
        steps=tuple(TaskStep(str(s.id), s.title, s.time_estimate, s.completed) for s in row.steps),
        due=row.due,
        due_set_at=row.due_set_at,
        let_go_at=row.let_go_at,
    )


def _step_rows(task: Task) -> list[StepRow]:
    return [
        StepRow(id=uuid.UUID(s.id), position=i, title=s.title, time_estimate=s.time_estimate, completed=s.completed)
        for i, s in enumerate(task.steps)
    ]


def _copy_fields(row: TaskRow, task: Task) -> None:
    row.title = task.title
    row.time_estimate = task.time_estimate
    row.tag = str(task.tag)
    row.priority = str(task.priority)
    row.completed = task.completed
    row.why = task.why
    row.due = task.due
    row.due_set_at = task.due_set_at
    row.let_go_at = task.let_go_at


class SqlTaskRepository(SqlRepository):
    async def _row(self, session: AsyncSession, user_id: str, task_id: str) -> TaskRow | None:
        key = _uuid(task_id)
        if key is None:
            return None
        return await session.scalar(select(TaskRow).where(TaskRow.id == key, TaskRow.user_id == user_id))

    async def list(self, user_id: str) -> list[Task]:
        async with self._transaction() as session:
            query = (
                select(TaskRow)
                .where(TaskRow.user_id == user_id, TaskRow.let_go_at.is_(None))
                .order_by(TaskRow.position, TaskRow.seq)
            )
            rows = await session.scalars(query)
            return [_to_domain(row) for row in rows]

    async def get(self, user_id: str, task_id: str) -> Task | None:
        async with self._transaction() as session:
            row = await self._row(session, user_id, task_id)
            return _to_domain(row) if row else None

    async def add(self, user_id: str, task: Task) -> None:
        row = TaskRow(id=uuid.UUID(task.id), user_id=user_id, steps=_step_rows(task))
        _copy_fields(row, task)
        async with self._transaction() as session:
            last = await session.scalar(select(func.max(TaskRow.position)).where(TaskRow.user_id == user_id))
            row.position = (last or 0) + 1
            session.add(row)

    async def save(self, user_id: str, task: Task) -> None:
        async with self._transaction() as session:
            row = await self._row(session, user_id, task.id)
            if row is None:
                raise KeyError(task.id)
            _copy_fields(row, task)
            existing = {step.id: step for step in row.steps}
            steps = []
            for i, step in enumerate(task.steps):
                step_row = existing.get(uuid.UUID(step.id)) or StepRow(id=uuid.UUID(step.id))
                step_row.position, step_row.title = i, step.title
                step_row.time_estimate, step_row.completed = step.time_estimate, step.completed
                steps.append(step_row)
            row.steps = steps

    async def delete(self, user_id: str, task_id: str) -> bool:
        async with self._transaction() as session:
            row = await self._row(session, user_id, task_id)
            if row is None:
                return False
            await session.delete(row)
            return True

    async def delete_all(self, user_id: str) -> None:
        async with self._transaction() as session:
            await session.execute(delete(TaskRow).where(TaskRow.user_id == user_id))

    async def reorder(self, user_id: str, task_ids: Sequence[str]) -> None:
        keys = [_uuid(task_id) for task_id in task_ids]
        async with self._transaction() as session:
            on_list = select(TaskRow.id).where(TaskRow.user_id == user_id, TaskRow.let_go_at.is_(None))
            owned = set(await session.scalars(on_list))
            if None in keys or set(keys) != owned or len(keys) != len(owned):
                raise KeyError("order")
            for position, key in enumerate(keys, start=1):
                await session.execute(
                    update(TaskRow).where(TaskRow.id == key, TaskRow.user_id == user_id).values(position=position)
                )


class UnconfiguredTaskRepository(Unconfigured):
    list = get = add = save = delete = delete_all = reorder = Unconfigured._unavailable
