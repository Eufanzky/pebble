"""``/api/account``: download everything, or delete it all (principle 3)."""

import pytest

from app.api.auth import get_current_user
from app.infrastructure.db.account import UnconfiguredAccountDataStore


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


async def fill(client) -> None:
    await client.post("/api/tasks", json={"title": "Read Chapter 4", "subtasks": [{"title": "Skim"}]})
    await client.patch("/api/preferences", json={"calmMode": True})
    await client.post("/api/activity", json={"agent": "PebbleVoice", "action": "Finished a task"})


async def test_export_is_a_json_download_of_everything(client, signed_in):
    await fill(client)

    resp = await client.get("/api/account/export")

    assert resp.status_code == 200
    assert resp.headers["content-disposition"] == 'attachment; filename="pebble-data.json"'
    assert resp.headers["cache-control"] == "no-store"
    body = resp.json()
    assert body["userId"] == "user-a"
    assert body["exportedAt"]
    assert [t["title"] for t in body["data"]["tasks"]] == ["Read Chapter 4"]
    assert body["data"]["preferences"][0]["calm_mode"] is True
    assert [e["action"] for e in body["data"]["activity_entries"]] == ["Finished a task"]


async def test_deleting_the_account_removes_everything_and_only_for_that_user(client, signed_in):
    await fill(client)
    signed_in.user = "user-b"
    await fill(client)
    signed_in.user = "user-a"

    assert (await client.delete("/api/account")).status_code == 204

    assert (await client.get("/api/account/export")).json()["data"] == {
        "tasks": [],
        "preferences": [],
        "activity_entries": [],
    }
    assert (await client.get("/api/tasks")).json() == []
    signed_in.user = "user-b"
    assert len((await client.get("/api/tasks")).json()) == 1


@pytest.mark.parametrize(("method", "url"), [("GET", "/api/account/export"), ("DELETE", "/api/account")])
async def test_account_needs_a_signed_in_user(client, method, url):
    assert (await client.request(method, url)).status_code == 401


@pytest.mark.parametrize(("method", "url"), [("GET", "/api/account/export"), ("DELETE", "/api/account")])
async def test_without_a_database_the_account_answers_503(client, signed_in, container, method, url):
    container.account_data = UnconfiguredAccountDataStore()

    assert (await client.request(method, url)).status_code == 503
