"""``AccountDataStore`` on Postgres, driven by the table metadata so a new table can't be left out.

A table belongs to a user either directly (a ``user_id`` column) or through a foreign key to a table
that does (``task_steps.task_id`` → ``tasks``). Every table must be one or the other:
``tests/integration/test_account_data.py`` fails otherwise.
"""

import uuid
from datetime import datetime

from sqlalchemy import Table, delete, select

from app.infrastructure.db.engine import SqlRepository, Unconfigured
from app.infrastructure.db.models import Base


def owner_path(table: Table) -> tuple[Table, str, str] | None:
    """For a child table, (parent, its column, the parent's column) of the foreign key to a user-owned table."""
    for fk in table.foreign_keys:
        parent = fk.column.table
        if "user_id" in parent.c:
            return parent, fk.parent.name, fk.column.name
    return None


def user_tables() -> list[Table]:
    """Every table, parents before children."""
    return list(Base.metadata.sorted_tables)


def _json(value: object) -> object:
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    return value


def _owned(table: Table, user_id: str):
    """A query for the table's rows that belong to the user."""
    if "user_id" in table.c:
        return select(table).where(table.c.user_id == user_id)
    path = owner_path(table)
    if path is None:
        raise LookupError(f"Table {table.name} has no owner: add user_id or a foreign key to a user-owned table")
    parent, column, parent_column = path
    parents = select(parent.c[parent_column]).where(parent.c.user_id == user_id)
    return select(table).where(table.c[column].in_(parents))


class SqlAccountDataStore(SqlRepository):
    async def export(self, user_id: str) -> dict[str, list[dict[str, object]]]:
        async with self._transaction() as session:
            data = {}
            for table in user_tables():
                rows = (await session.execute(_owned(table, user_id))).mappings()
                data[table.name] = [{key: _json(value) for key, value in row.items()} for row in rows]
            return data

    async def delete(self, user_id: str) -> None:
        async with self._transaction() as session:
            for table in reversed(user_tables()):
                owned = _owned(table, user_id).with_only_columns(*table.primary_key.columns)
                await session.execute(delete(table).where(table.primary_key.columns[0].in_(owned)))


class UnconfiguredAccountDataStore(Unconfigured):
    export = delete = Unconfigured._unavailable
