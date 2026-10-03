"""Alembic runs from an empty database, back down, and matches the models."""

import asyncio

from alembic import command
from sqlalchemy import inspect, text
from sqlalchemy.ext.asyncio import create_async_engine

from app.infrastructure.db.models import Base
from tests.integration.conftest import alembic_config, reset_schema


async def table_names(url: str) -> set[str]:
    engine = create_async_engine(url)
    async with engine.connect() as connection:
        names = await connection.run_sync(lambda sync: set(inspect(sync).get_table_names()))
    await engine.dispose()
    return names


def test_upgrade_from_empty_and_back(database_url):
    config = alembic_config(database_url)
    reset_schema(database_url)

    command.upgrade(config, "head")
    assert asyncio.run(table_names(database_url)) == {*Base.metadata.tables, "alembic_version"}

    command.downgrade(config, "base")
    assert asyncio.run(table_names(database_url)) == {"alembic_version"}

    command.upgrade(config, "head")


def test_the_migrations_match_the_models(database_url):
    """``alembic check`` fails when a model changed without a migration."""
    command.check(alembic_config(database_url))


def test_positions_keep_the_order_existing_lists_had(database_url):
    """0003 numbers each user's tasks in the order they were added."""
    config = alembic_config(database_url)
    reset_schema(database_url)
    command.upgrade(config, "0002")

    async def insert() -> None:
        engine = create_async_engine(database_url)
        async with engine.begin() as connection:
            for user, title in [("a", "First"), ("b", "Theirs"), ("a", "Second"), ("a", "Third")]:
                await connection.execute(
                    text(
                        "INSERT INTO tasks (id, user_id, title, time_estimate, tag, priority, completed, why) "
                        "VALUES (gen_random_uuid(), :user, :title, '', 'project', 'medium', false, '')"
                    ),
                    {"user": user, "title": title},
                )
        await engine.dispose()

    async def read() -> list[tuple]:
        engine = create_async_engine(database_url)
        async with engine.connect() as connection:
            rows = (await connection.execute(text("SELECT user_id, title, position FROM tasks ORDER BY seq"))).all()
        await engine.dispose()
        return [tuple(row) for row in rows]

    asyncio.run(insert())
    command.upgrade(config, "head")

    assert asyncio.run(read()) == [("a", "First", 1), ("b", "Theirs", 1), ("a", "Second", 2), ("a", "Third", 3)]
