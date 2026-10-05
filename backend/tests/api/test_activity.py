"""``/api/activity`` over HTTP: reading the log. Only the agents write it, on the server (7.3)."""

from datetime import datetime

import pytest

from app.api.auth import get_current_user
from app.domain.agents import AgentName
from app.infrastructure.db.activity import UnconfiguredActivityRepository

URL = "/api/activity"


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


async def log(container, action: str, user: str = "user-a") -> None:
    await container.activity.record(user, AgentName.CALM_SENSE, action, "Small steps.")


async def test_a_new_log_is_empty(client, signed_in):
    assert (await client.get(URL)).json() == []


async def test_an_entry_has_the_agent_reasoning_safety_and_server_time(client, signed_in, container):
    await log(container, 'Broke "Essay" into 3 steps')

    [entry] = (await client.get(URL)).json()

    assert entry == {
        "id": entry["id"],
        "timestamp": entry["timestamp"],
        "agent": "CalmSense",
        "action": 'Broke "Essay" into 3 steps',
        "reasoning": "Small steps.",
        "safetyStatus": "passed",
        "explanation": "",
    }
    assert datetime.fromisoformat(entry["timestamp"]).tzinfo is not None


async def test_the_log_is_newest_first_and_limited(client, signed_in, container):
    for n in range(3):
        await log(container, f"Step {n}")

    assert [e["action"] for e in (await client.get(URL)).json()] == ["Step 2", "Step 1", "Step 0"]
    assert [e["action"] for e in (await client.get(URL, params={"limit": 2})).json()] == ["Step 2", "Step 1"]


async def test_nobody_can_write_an_entry_in_an_agents_name_over_http(client, signed_in):
    body = {"agent": "WhyBot", "action": "Showed an explanation", "reasoning": "It didn't."}

    assert (await client.post(URL, json=body)).status_code == 405
    assert (await client.get(URL)).json() == []


@pytest.mark.parametrize("limit", [0, 201])
async def test_the_limit_is_bounded(client, signed_in, limit):
    assert (await client.get(URL, params={"limit": limit})).status_code == 422


async def test_users_never_see_each_others_log(client, signed_in, container):
    await log(container, "Theirs", user="user-a")

    signed_in.user = "user-b"
    assert (await client.get(URL)).json() == []


async def test_activity_needs_a_signed_in_user(client):
    assert (await client.get(URL)).status_code == 401


async def test_without_a_database_the_log_answers_503(client, signed_in, container):
    container.activity_repository = UnconfiguredActivityRepository()

    assert (await client.get(URL)).status_code == 503
