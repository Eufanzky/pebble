"""Alembic runs from an empty database, back down, and matches the models."""

import asyncio

from alembic import command
from sqlalchemy import inspect
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
