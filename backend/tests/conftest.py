"""Shared fixtures: the FastAPI app, an HTTP client for it, and fakes for the AI services.

The client talks to the app in-process through ``httpx.ASGITransport``. That
transport doesn't run the lifespan, so no Azure service (Cosmos, telemetry) is
initialised and no test touches the network.
"""

from collections.abc import AsyncIterator, Iterator

import pytest
import respx
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.config import settings
from tests.fakes import FakeContentSafety, FakeLLM

CONTENT_SAFETY_ENDPOINT = "https://content-safety.test"


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


@pytest.fixture
def llm(monkeypatch: pytest.MonkeyPatch) -> FakeLLM:
    """A scripted LLM behind both Semantic Kernel and the direct OpenAI client."""
    fake = FakeLLM()
    monkeypatch.setattr("app.agents.orchestrator.get_kernel", lambda: fake)
    monkeypatch.setattr("app.services.openai_client.get_openai_client", lambda: fake.openai_client)
    return fake


@pytest.fixture
def content_safety(monkeypatch: pytest.MonkeyPatch) -> FakeContentSafety:
    """Content Safety configured, with the text-analysis client faked. Every text is safe unless flagged."""
    fake = FakeContentSafety()
    monkeypatch.setattr(settings, "content_safety_endpoint", CONTENT_SAFETY_ENDPOINT)
    monkeypatch.setattr(settings, "content_safety_key", "test-key")
    monkeypatch.setattr("app.services.content_safety._get_client", lambda: fake)
    return fake


@pytest.fixture
def content_safety_http(content_safety: FakeContentSafety) -> Iterator[respx.MockRouter]:
    """Prompt Shields and Groundedness Detection over respx. By default: no attack, grounded."""
    with respx.mock(base_url=CONTENT_SAFETY_ENDPOINT, assert_all_called=False) as router:
        router.post("/contentsafety/text:shieldPrompt", name="shield").respond(
            json={"userPromptAnalysis": {"attackDetected": False}, "documentsAnalysis": []}
        )
        router.post("/contentsafety/text:detectGroundedness", name="groundedness").respond(
            json={"ungroundedDetected": False, "ungroundedPercentage": 0.0, "ungroundedDetails": []}
        )
        yield router
