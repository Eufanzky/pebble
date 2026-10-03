"""Export and deletion cover every user-owned table, read from the ORM metadata (``specs/testing.md``).

Adding a table without an owner, or one these can't reach, fails here.
"""

import json
import uuid
from datetime import UTC, datetime

import pytest
from sqlalchemy import Column, Integer, MetaData, Table, func, select

from app.domain.activity import ActivityEntry
from app.domain.agents import AgentName
from app.domain.progress import ProgressEvent, ProgressKind
from app.domain.tasks import Task, TaskStep
from app.infrastructure.db.account import SqlAccountDataStore, _owned, owner_path, user_tables
from app.infrastructure.db.activity import SqlActivityRepository
from app.infrastructure.db.models import Base
from app.infrastructure.db.preferences import SqlPreferencesRepository
from app.infrastructure.db.progress import SqlProgressRepository
from app.infrastructure.db.tasks import SqlTaskRepository

TABLES = [table.name for table in Base.metadata.sorted_tables]


def new_id() -> str:
    return str(uuid.uuid4())


async def fill(sessions, user_id: str) -> None:
    """At least one row in every table for ``user_id``."""
    task = Task(new_id(), f"{user_id}'s task", steps=(TaskStep(new_id(), "Step"),))
    await SqlTaskRepository(sessions).add(user_id, task)
    await SqlPreferencesRepository(sessions).save(user_id, {"calm_mode": True})
    await SqlProgressRepository(sessions).add(
        user_id, ProgressEvent(ProgressKind.FOCUS, new_id(), datetime.now(UTC), minutes=25)
    )
    await SqlActivityRepository(sessions).add(
        user_id, ActivityEntry(new_id(), datetime.now(UTC), AgentName.CALM_SENSE, "Did a thing", "Because.")
    )


async def count(sessions, table_name: str, user_id: str) -> int:
    table = Base.metadata.tables[table_name]
    async with sessions() as session:
        return await session.scalar(select(func.count()).select_from(_owned(table, user_id).subquery()))


@pytest.mark.parametrize("table_name", TABLES)
def test_every_table_belongs_to_a_user(table_name):
    table = Base.metadata.tables[table_name]
    assert "user_id" in table.c or owner_path(table) is not None


def test_parents_come_before_children():
    names = [t.name for t in user_tables()]
    assert names.index("tasks") < names.index("task_steps")


@pytest.fixture
async def filled(sessions):
    await fill(sessions, "a")
    await fill(sessions, "b")
    return sessions


@pytest.mark.parametrize("table_name", TABLES)
async def test_the_export_has_every_table_and_only_the_users_rows(filled, table_name):
    exported = await SqlAccountDataStore(filled).export("a")

    assert set(exported) == set(TABLES)
    assert len(exported[table_name]) == await count(filled, table_name, "a") > 0
    assert "b's task" not in str(exported)


async def test_the_export_is_json_ready(filled):
    json.dumps(await SqlAccountDataStore(filled).export("a"))


@pytest.mark.parametrize("table_name", TABLES)
async def test_deleting_an_account_leaves_no_row_in_any_table(filled, table_name):
    await SqlAccountDataStore(filled).delete("a")

    assert await count(filled, table_name, "a") == 0
    assert await count(filled, table_name, "b") > 0


async def test_a_table_without_an_owner_is_refused():
    orphan = Table("orphans", MetaData(), Column("id", Integer, primary_key=True))

    with pytest.raises(LookupError):
        _owned(orphan, "a")
