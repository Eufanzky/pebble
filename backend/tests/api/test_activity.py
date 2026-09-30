"""``/api/activity`` over HTTP: the user's own actions, and reading the log."""

from datetime import datetime

import pytest

from app.api.auth import get_current_user_id
from app.infrastructure.config import settings
from app.infrastructure.db.activity import UnconfiguredActivityRepository

URL = "/api/activity"
ENTRY = {"agent": "PebbleVoice", "action": 'You finished "Email Sam"', "reasoning": "Task completed by you."}


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user_id] = lambda: SignedIn.user
    return SignedIn


async def test_a_new_log_is_empty(client, signed_in):
    assert (await client.get(URL)).json() == []


async def test_post_logs_an_entry_with_the_server_time(client, signed_in):
    resp = await client.post(URL, json=ENTRY)

    assert resp.status_code == 201
    body = resp.json()
    assert body == {**ENTRY, "id": body["id"], "timestamp": body["timestamp"], "safetyStatus": "passed"}
    assert datetime.fromisoformat(body["timestamp"]).tzinfo is not None
    assert (await client.get(URL)).json() == [body]


async def test_the_log_is_newest_first_and_limited(client, signed_in):
    for n in range(3):
        await client.post(URL, json={**ENTRY, "action": f"Step {n}"})

    assert [e["action"] for e in (await client.get(URL)).json()] == ["Step 2", "Step 1", "Step 0"]
    assert [e["action"] for e in (await client.get(URL, params={"limit": 2})).json()] == ["Step 2", "Step 1"]


@pytest.mark.parametrize(
    "body",
    [{**ENTRY, "agent": "Orchestrator"}, {**ENTRY, "action": ""}, {**ENTRY, "safetyStatus": "maybe"}],
    ids=["unknown-agent", "empty-action", "unknown-status"],
)
async def test_post_validates(client, signed_in, body):
    assert (await client.post(URL, json=body)).status_code == 422


@pytest.mark.parametrize("limit", [0, 201])
async def test_the_limit_is_bounded(client, signed_in, limit):
    assert (await client.get(URL, params={"limit": limit})).status_code == 422


async def test_users_never_see_each_others_log(client, signed_in):
    await client.post(URL, json=ENTRY)

    signed_in.user = "user-b"
    assert (await client.get(URL)).json() == []


async def test_activity_needs_a_signed_in_user(client, monkeypatch):
    monkeypatch.setattr(settings, "dev_mode", False)

    assert (await client.get(URL)).status_code == 401
    assert (await client.post(URL, json=ENTRY)).status_code == 401


async def test_without_a_database_the_log_answers_503(client, signed_in, container):
    container.activity_repository = UnconfiguredActivityRepository()

    assert (await client.get(URL)).status_code == 503
    assert (await client.post(URL, json=ENTRY)).status_code == 503
