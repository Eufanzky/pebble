"""Real Postgres for repository and migration tests.

``TEST_DATABASE_URL`` points at a database these tests own: its ``public`` schema is dropped and rebuilt
with ``alembic upgrade head`` at the start of the run, and every table is emptied before each test.
Without it the tests skip, unless ``REQUIRE_TEST_DATABASE=true`` (CI), where they fail instead.

    docker compose up -d db
    TEST_DATABASE_URL=postgresql+asyncpg://pebble:pebble@localhost:5432/pebble_test uv run pytest
"""

import asyncio
import os
from collections.abc import AsyncIterator
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.infrastructure.db.engine import build_engine, build_sessions
from app.infrastructure.db.models import Base

BACKEND = Path(__file__).resolve().parents[2]


def alembic_config(url: str) -> Config:
    config = Config(str(BACKEND / "alembic.ini"))
    config.set_main_option("sqlalchemy.url", url)
    config.attributes["configure_logger"] = False
    return config


async def _run(url: str, *statements: str) -> None:
    engine = create_async_engine(url)
    async with engine.begin() as connection:
        for statement in statements:
            await connection.execute(text(statement))
    await engine.dispose()


def reset_schema(url: str) -> None:
    asyncio.run(_run(url, "DROP SCHEMA public CASCADE", "CREATE SCHEMA public"))


@pytest.fixture(scope="session")
def database_url() -> str:
    url = os.environ.get("TEST_DATABASE_URL")
    if not url:
        if os.environ.get("REQUIRE_TEST_DATABASE") == "true":
            pytest.fail("REQUIRE_TEST_DATABASE is set but TEST_DATABASE_URL is not")
        pytest.skip("TEST_DATABASE_URL is not set")
    reset_schema(url)
    command.upgrade(alembic_config(url), "head")
    return url


@pytest.fixture
async def sessions(database_url: str) -> AsyncIterator[async_sessionmaker[AsyncSession]]:
    """A session factory on the test database, every table empty."""
    engine = build_engine(database_url)
    tables = ", ".join(table.name for table in Base.metadata.sorted_tables)
    async with engine.begin() as connection:
        await connection.execute(text(f"TRUNCATE {tables} RESTART IDENTITY CASCADE"))
    yield build_sessions(engine)
    await engine.dispose()
