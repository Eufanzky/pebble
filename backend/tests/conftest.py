"""Shared fixtures: the FastAPI app, an HTTP client for it, and the fakes behind every port.

The client talks to the app in-process through ``httpx.ASGITransport``. That
transport doesn't run the lifespan, so no Azure service (Cosmos, telemetry) is
initialised and no test touches the network.

Every test runs with a container of fakes (``FakeLLM``, ``ScriptedSafety``, the real
regex PII redactor, in-memory stores), so no test can reach a provider configured in a developer's
``.env``.
"""

from collections.abc import AsyncIterator, Iterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.api.dependencies import Container, set_container
from app.infrastructure.config import settings
from app.infrastructure.llm.fake import FakeLLM
from tests.fakes import (
    InMemoryAccountData,
    InMemoryActivityRepository,
    InMemoryAdaptationRepository,
    InMemoryPreferencesRepository,
    InMemoryProgressRepository,
    InMemoryTaskRepository,
    ScriptedSafety,
)

TEST_TOKEN_SECRET = "test-token-secret-at-least-32-bytes-long"


@pytest.fixture(autouse=True)
def auth_secret(monkeypatch) -> str:
    """Sign-in is set up in every test: a request without a valid token gets a 401, not a 503."""
    monkeypatch.setattr(settings, "auth_token_secret", TEST_TOKEN_SECRET)
    return TEST_TOKEN_SECRET


@pytest.fixture(autouse=True)
def container() -> Iterator[Container]:
    """The adapters every test runs with: fakes for the LLM, Content Safety and the stores."""
    tasks, preferences, activity = (
        InMemoryTaskRepository(),
        InMemoryPreferencesRepository(),
        InMemoryActivityRepository(),
    )
    fakes = Container(
        llm=FakeLLM(),
        safety_checker=ScriptedSafety(),
        task_repository=tasks,
        preferences_repository=preferences,
        activity_repository=activity,
        account_data=InMemoryAccountData(tasks, preferences, activity),
        progress_repository=InMemoryProgressRepository(),
        adaptation_repository=InMemoryAdaptationRepository(),
    )
    set_container(fakes)
    yield fakes
    set_container(None)


@pytest.fixture
def adaptation_repository(container: Container) -> InMemoryAdaptationRepository:
    """What AdaptLens learns from: ``adaptation_repository.signals[user_id]``, and what was dismissed."""
    return container.adaptation_repository


@pytest.fixture
def llm(container: Container) -> FakeLLM:
    """The scripted LLM: ``llm.script("orchestrator", {...})``, then inspect ``llm.calls``."""
    return container.llm


@pytest.fixture
def safety(container: Container) -> ScriptedSafety:
    """Content Safety: everything is safe unless ``safety.flag(...)`` or ``safety.attack_on(...)``."""
    return container.safety_checker


@pytest.fixture
def task_repository(container: Container) -> InMemoryTaskRepository:
    """The task store, in memory. ``tests/integration`` runs the Postgres one."""
    return container.task_repository


@pytest.fixture
def preferences_repository(container: Container) -> InMemoryPreferencesRepository:
    return container.preferences_repository


@pytest.fixture
def activity_repository(container: Container) -> InMemoryActivityRepository:
    """What the agents logged: ``activity_repository.entries[user_id]``, oldest first."""
    return container.activity_repository


@pytest.fixture
def progress_repository(container: Container) -> InMemoryProgressRepository:
    """What the user finished: ``progress_repository.events[user_id]``."""
    return container.progress_repository


@pytest.fixture
def app() -> Iterator[FastAPI]:
    """The app under test. Dependency overrides set by a test are cleared afterwards."""
    from app.main import app as fastapi_app

    yield fastapi_app
    fastapi_app.dependency_overrides.clear()


@pytest.fixture
async def client(app: FastAPI) -> AsyncIterator[AsyncClient]:
    """An async HTTP client bound to the app."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as http_client:
        yield http_client
