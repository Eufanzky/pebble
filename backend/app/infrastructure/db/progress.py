"""``ProgressRepository`` on Postgres, and the stand-in used when no database is configured."""

import uuid

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.domain.progress import ProgressEvent, ProgressKind
from app.domain.tasks import TaskTag
from app.infrastructure.db.engine import SqlRepository, Unconfigured
from app.infrastructure.db.models import ProgressRow


class SqlProgressRepository(SqlRepository):
    async def add(self, user_id: str, event: ProgressEvent) -> bool:
        statement = (
            insert(ProgressRow)
            .values(
                id=uuid.uuid4(),
                user_id=user_id,
                kind=str(event.kind),
                item_id=event.item_id,
                tag=str(event.tag) if event.tag else None,
                minutes=event.minutes,
                created_at=event.at,
            )
            .on_conflict_do_nothing(constraint="uq_progress_events_user_kind_item")
            .returning(ProgressRow.id)
        )
        async with self._transaction() as session:
            return (await session.execute(statement)).first() is not None

    async def list(self, user_id: str) -> list[ProgressEvent]:
        query = select(ProgressRow).where(ProgressRow.user_id == user_id).order_by(ProgressRow.created_at)
        async with self._transaction() as session:
            return [
                ProgressEvent(
                    kind=ProgressKind(row.kind),
                    item_id=row.item_id,
                    at=row.created_at,
                    tag=TaskTag.parse(row.tag) if row.tag else None,
                    minutes=row.minutes,
                )
                for row in await session.scalars(query)
            ]


class UnconfiguredProgressRepository(Unconfigured):
    add = list = Unconfigured._unavailable
