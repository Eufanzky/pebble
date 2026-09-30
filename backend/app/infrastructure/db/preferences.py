"""``PreferencesRepository`` on Postgres, and the stand-in used when no database is configured."""

from sqlalchemy.dialects.postgresql import insert

from app.infrastructure.db.engine import SqlRepository, Unconfigured
from app.infrastructure.db.models import PreferencesRow


class SqlPreferencesRepository(SqlRepository):
    async def get(self, user_id: str) -> dict[str, object] | None:
        async with self._transaction() as session:
            row = await session.get(PreferencesRow, user_id)
            return dict(row.values) if row else None

    async def save(self, user_id: str, values: dict[str, object]) -> None:
        upsert = insert(PreferencesRow).values(user_id=user_id, values=values)
        upsert = upsert.on_conflict_do_update(
            index_elements=[PreferencesRow.user_id],
            set_={"values": upsert.excluded["values"], "updated_at": upsert.excluded.updated_at},
        )
        async with self._transaction() as session:
            await session.execute(upsert)


class UnconfiguredPreferencesRepository(Unconfigured):
    get = save = Unconfigured._unavailable
