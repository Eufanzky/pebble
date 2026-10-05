"""``ActivityRepository`` on Postgres, and the stand-in used when no database is configured."""

import uuid

from sqlalchemy import select

from app.domain.activity import ActivityEntry, SafetyStatus
from app.domain.agents import AgentName
from app.infrastructure.db.engine import SqlRepository, Unconfigured
from app.infrastructure.db.models import ActivityRow


class SqlActivityRepository(SqlRepository):
    async def add(self, user_id: str, entry: ActivityEntry) -> None:
        async with self._transaction() as session:
            session.add(
                ActivityRow(
                    id=uuid.UUID(entry.id),
                    user_id=user_id,
                    created_at=entry.timestamp,
                    agent=str(entry.agent),
                    action=entry.action,
                    reasoning=entry.reasoning,
                    safety_status=str(entry.safety_status),
                    explanation=entry.explanation,
                )
            )

    async def recent(self, user_id: str, limit: int) -> list[ActivityEntry]:
        query = select(ActivityRow).where(ActivityRow.user_id == user_id).order_by(ActivityRow.seq.desc()).limit(limit)
        async with self._transaction() as session:
            return [
                ActivityEntry(
                    id=str(row.id),
                    timestamp=row.created_at,
                    agent=AgentName(row.agent),
                    action=row.action,
                    reasoning=row.reasoning,
                    safety_status=SafetyStatus(row.safety_status),
                    explanation=row.explanation,
                )
                for row in await session.scalars(query)
            ]


class UnconfiguredActivityRepository(Unconfigured):
    add = recent = Unconfigured._unavailable
