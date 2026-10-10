"""The per-user limit on agent calls (10.4): over it, a gentle 429 with ``Retry-After``."""

from datetime import UTC, datetime, timedelta

import pytest

from app.api.auth import get_current_user
from app.api.dependencies import Container
from app.api.errors import RESTING
from app.application.ports.llm import LLMRateLimitedError
from app.application.rate_limit import AgentCallLimit
from app.domain.rate_limit import RateLimit
from app.infrastructure.config import Settings

NOW = datetime(2026, 10, 10, 12, 0, tzinfo=UTC)


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


@pytest.fixture
def two_a_minute(container):
    container.agent_call_limit = AgentCallLimit([RateLimit(2, timedelta(minutes=1))], clock=lambda: NOW)


async def new_task(client) -> str:
    return (await client.post("/api/tasks", json={"title": "Write the essay"})).json()["id"]


# Every endpoint that calls the LLM counts
AGENT_CALLS = [
    ("/api/agents/chat", {"message": "Hello"}),
    ("/api/agents/decompose", {"taskTitle": "Write the essay"}),
    ("/api/agents/simplify", {"text": "A long and winding sentence.", "readingLevel": 3}),
    ("/api/agents/motivate", {}),
    ("breakdown", {}),
]


@pytest.mark.usefixtures("two_a_minute")
@pytest.mark.parametrize(("url", "body"), AGENT_CALLS)
async def test_over_the_limit_an_agent_call_is_a_gentle_429_with_retry_after(
    client, signed_in, llm, url, body
):
    if url == "breakdown":
        url = f"/api/tasks/{await new_task(client)}/breakdown"
    for _ in range(2):
        assert (await client.post(url, json=body)).status_code == 200
    asked = len(llm.calls)

    resp = await client.post(url, json=body)

    assert resp.status_code == 429
    assert resp.json() == {"detail": RESTING}
    assert resp.headers["Retry-After"] == "60"
    assert len(llm.calls) == asked  # the LLM wasn't asked


@pytest.mark.usefixtures("two_a_minute")
async def test_the_calls_share_one_count(client, signed_in):
    await client.post("/api/agents/chat", json={"message": "Hello"})
    await client.post(f"/api/tasks/{await new_task(client)}/breakdown", json={})

    assert (await client.post("/api/agents/decompose", json={"taskTitle": "Write"})).status_code == 429


@pytest.mark.usefixtures("two_a_minute")
async def test_one_users_calls_dont_limit_another(client, signed_in):
    for _ in range(3):
        await client.post("/api/agents/chat", json={"message": "Hello"})

    signed_in.user = "user-b"
    assert (await client.post("/api/agents/chat", json={"message": "Hello"})).status_code == 200


@pytest.mark.usefixtures("two_a_minute")
async def test_everything_else_stays_open(client, signed_in):
    for _ in range(3):
        await client.post("/api/agents/chat", json={"message": "Hello"})

    assert (await client.get("/api/tasks")).status_code == 200
    assert (await client.post("/api/tasks", json={"title": "Still fine"})).status_code == 201
    assert (await client.get("/api/activity")).status_code == 200


@pytest.mark.usefixtures("two_a_minute")
async def test_signed_out_is_still_a_401(client):
    resp = await client.post("/api/agents/chat", json={"message": "Hello"})

    assert resp.status_code == 401


async def test_a_provider_limit_says_the_same_words(client, signed_in, llm):
    # The backend's own limit and the provider's both read as "resting"; the frontend shows them alike
    llm.script("orchestrator", LLMRateLimitedError("slow down", retry_after=30))

    resp = await client.post("/api/agents/chat", json={"message": "Hello"})

    assert (resp.status_code, resp.json(), resp.headers["Retry-After"]) == (503, {"detail": RESTING}, "30")


def test_the_settings_set_a_minute_and_a_day_limit():
    container = Container.from_settings(Settings(agent_calls_per_minute=4, agent_calls_per_day=50, _env_file=None))

    assert container.agent_call_limit.limits == (
        RateLimit(4, timedelta(minutes=1)),
        RateLimit(50, timedelta(days=1)),
    )


def test_by_default_ten_a_minute_and_a_hundred_a_day():
    defaults = Settings(_env_file=None)

    assert (defaults.agent_calls_per_minute, defaults.agent_calls_per_day) == (10, 100)
