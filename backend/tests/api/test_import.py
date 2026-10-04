"""``POST /api/import``: what the browser kept before sign-in, moved into the account once."""

import pytest

from app.api.auth import get_current_user

URL = "/api/import"
BODY = {
    "tasks": [
        {
            "title": "Read Chapter 4",
            "tag": "study",
            "priority": "high",
            "completed": False,
            "whyExplanation": "One step per section.",
            "steps": [{"title": "Skim", "timeEstimate": "~5 min", "completed": True}, {"title": "Read"}],
        }
    ],
    "preferences": {"calmMode": True, "readingLevel": 3},
    "activity": [
        {
            "agent": "AdaptLens",
            "action": "Reading level adjusted to 3",
            "reasoning": "User moved the slider.",
            "safetyStatus": "passed",
            "timestamp": "2026-09-01T10:00:00Z",
        }
    ],
}


@pytest.fixture(autouse=True)
def signed_in(app):
    app.dependency_overrides[get_current_user] = lambda: "user-a"


async def test_imports_tasks_preferences_and_the_log(client):
    resp = await client.post(URL, json=BODY)

    assert resp.status_code == 200
    assert resp.json() == {"tasks": 1, "preferences": True, "activity": 1}

    [task] = (await client.get("/api/tasks")).json()
    assert task["title"] == "Read Chapter 4"
    assert [(s["title"], s["completed"]) for s in task["steps"]] == [("Skim", True), ("Read", False)]
    assert (await client.get("/api/preferences")).json()["calmMode"] is True
    [entry] = (await client.get("/api/activity")).json()
    assert entry["action"] == "Reading level adjusted to 3"
    assert entry["timestamp"].startswith("2026-09-01T10:00:00")


async def test_the_accounts_own_preferences_win(client):
    await client.patch("/api/preferences", json={"readingLevel": 8})

    resp = await client.post(URL, json=BODY)

    assert resp.json()["preferences"] is False
    assert (await client.get("/api/preferences")).json()["readingLevel"] == 8


async def test_an_empty_import_is_fine(client):
    assert (await client.post(URL, json={})).json() == {"tasks": 0, "preferences": False, "activity": 0}


@pytest.mark.parametrize(
    "body",
    [
        {"tasks": [{"title": ""}]},
        {"preferences": {"readingLevel": 12}},
        {"activity": [{"agent": "Nobody", "action": "x", "timestamp": "2026-09-01T10:00:00Z"}]},
        {"activity": [{"agent": "WhyBot", "action": "x"}]},
    ],
    ids=["empty-title", "bad-level", "unknown-agent", "no-timestamp"],
)
async def test_the_import_is_validated_as_a_whole(client, body):
    assert (await client.post(URL, json=body)).status_code == 422
    assert (await client.get("/api/tasks")).json() == []


async def test_import_needs_a_signed_in_user(client, app):
    app.dependency_overrides.clear()

    assert (await client.post(URL, json={})).status_code == 401
