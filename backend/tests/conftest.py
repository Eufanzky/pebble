"""Shared fixtures: the FastAPI app, an HTTP client for it, and the fakes behind every port.

The client talks to the app in-process through ``httpx.ASGITransport``. That
transport doesn't run the lifespan, so no Azure service (Cosmos, telemetry) is
initialised and no test touches the network.

Every test runs with a container of fakes (``FakeLLM``, ``ScriptedSafety``, the real
regex PII redactor, an in-memory task store), so no test can reach a provider configured in a developer's
``.env``.
"""

from collections.abc import AsyncIterator, Iterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.api.dependencies import Container, set_container
from app.infrastructure.llm.fake import FakeLLM
from tests.fakes import InMemoryTaskRepository, ScriptedSafety


@pytest.fixture(autouse=True)
def container() -> Iterator[Container]:
    """The adapters every test runs with: fakes for the LLM, Content Safety and the task store."""
    fakes = Container(llm=FakeLLM(), safety_checker=ScriptedSafety(), task_repository=InMemoryTaskRepository())
    set_container(fakes)
    yield fakes
    set_container(None)


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
