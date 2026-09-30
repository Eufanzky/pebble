"""A database that can't be reached becomes ``PersistenceError`` (a gentle 503), never a driver error."""

import pytest

from app.application.ports.persistence import PersistenceError
from app.infrastructure.db.account import SqlAccountDataStore
from app.infrastructure.db.activity import SqlActivityRepository
from app.infrastructure.db.engine import build_engine, build_sessions
from app.infrastructure.db.preferences import SqlPreferencesRepository
from app.infrastructure.db.tasks import SqlTaskRepository

# Nothing listens on port 1.
UNREACHABLE = "postgresql+asyncpg://pebble:pebble@127.0.0.1:1/pebble"


@pytest.mark.parametrize(
    ("repository", "call"),
    [
        (SqlTaskRepository, lambda r: r.list("a")),
        (SqlPreferencesRepository, lambda r: r.get("a")),
        (SqlActivityRepository, lambda r: r.recent("a", 10)),
        (SqlAccountDataStore, lambda r: r.delete("a")),
    ],
    ids=["tasks", "preferences", "activity", "account"],
)
async def test_an_unreachable_database_is_a_persistence_error(repository, call):
    engine = build_engine(UNREACHABLE)
    try:
        with pytest.raises(PersistenceError):
            await call(repository(build_sessions(engine)))
    finally:
        await engine.dispose()
