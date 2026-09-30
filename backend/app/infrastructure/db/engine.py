"""The async engine, the session factory, and the transaction every repository call runs in."""

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.application.ports.persistence import PersistenceError


def build_engine(url: str) -> AsyncEngine:
    return create_async_engine(url, pool_pre_ping=True)


def build_sessions(engine: AsyncEngine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(engine, expire_on_commit=False)


class SqlRepository:
    """One transaction per call. Driver and connection errors become ``PersistenceError``."""

    def __init__(self, sessions: async_sessionmaker[AsyncSession]) -> None:
        self._sessions = sessions

    @asynccontextmanager
    async def _transaction(self) -> AsyncIterator[AsyncSession]:
        try:
            async with self._sessions() as session, session.begin():
                yield session
        except (SQLAlchemyError, OSError) as exc:
            raise PersistenceError(str(exc)) from exc


class Unconfigured:
    """No ``DATABASE_URL``: nothing can be saved, and every call says so."""

    async def _unavailable(self, *_args: object) -> None:
        raise PersistenceError("DATABASE_URL is not set")
