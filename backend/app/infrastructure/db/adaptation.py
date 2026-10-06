"""``AdaptationRepository`` on Postgres, and the stand-in used when no database is configured."""

import uuid
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

from app.domain.adaptation import Signal, SignalKind
from app.infrastructure.db.engine import SqlRepository, Unconfigured
from app.infrastructure.db.models import SuggestionDismissalRow, UsageSignalRow


class SqlAdaptationRepository(SqlRepository):
    async def add_signal(self, user_id: str, signal: Signal) -> None:
        async with self._transaction() as session:
            session.add(
                UsageSignalRow(
                    id=uuid.uuid4(), user_id=user_id, kind=str(signal.kind), value=signal.value, created_at=signal.at
                )
            )

    async def recent_signals(self, user_id: str, limit: int) -> list[Signal]:
        query = (
            select(UsageSignalRow)
            .where(UsageSignalRow.user_id == user_id)
            .order_by(UsageSignalRow.seq.desc())
            .limit(limit)
        )
        async with self._transaction() as session:
            return [Signal(SignalKind(row.kind), row.value, row.created_at) for row in await session.scalars(query)]

    async def dismiss(self, user_id: str, key: str, at: datetime) -> None:
        statement = (
            insert(SuggestionDismissalRow)
            .values(id=uuid.uuid4(), user_id=user_id, key=key, dismissed_at=at)
            .on_conflict_do_update(constraint="uq_suggestion_dismissals_user_key", set_={"dismissed_at": at})
        )
        async with self._transaction() as session:
            await session.execute(statement)

    async def dismissals(self, user_id: str) -> dict[str, datetime]:
        query = select(SuggestionDismissalRow).where(SuggestionDismissalRow.user_id == user_id)
        async with self._transaction() as session:
            return {row.key: row.dismissed_at for row in await session.scalars(query)}


class UnconfiguredAdaptationRepository(Unconfigured):
    add_signal = recent_signals = dismiss = dismissals = Unconfigured._unavailable
