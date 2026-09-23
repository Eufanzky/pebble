"""Shared fixtures: the FastAPI app and an HTTP client for it.

The client talks to the app in-process through ``httpx.ASGITransport``. That
transport doesn't run the lifespan, so no Azure service (Cosmos, telemetry) is
initialised and no test touches the network.
"""

from collections.abc import AsyncIterator, Iterator

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient


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
