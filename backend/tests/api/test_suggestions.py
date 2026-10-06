"""``/api/suggestions``: AdaptLens over HTTP, learning from what the user really did (7.6)."""

import pytest

from app.api.auth import get_current_user

URL = "/api/suggestions"


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


async def simplify_at(client, level: int, times: int = 3) -> None:
    for _ in range(times):
        assert (
            await client.post("/api/agents/simplify", json={"text": "A hard text.", "readingLevel": level})
        ).status_code == 200


async def test_a_new_user_gets_no_suggestion(client, signed_in):
    resp = await client.get(URL)

    assert resp.status_code == 200
    assert resp.json() is None


async def test_reading_uploads_at_one_level_suggests_it_as_the_default(client, signed_in):
    await simplify_at(client, 3)

    assert (await client.get(URL)).json() == {
        "key": "reading_level:3",
        "preference": "readingLevel",
        "value": 3,
        "reason": "You picked level 3 for 3 of your last 3 documents. Your default is 5.",
    }
    assert (await client.get("/api/preferences")).json()["readingLevel"] == 5


async def test_accepting_changes_the_preference_and_answers_with_them(client, signed_in, activity_repository):
    await simplify_at(client, 3)

    resp = await client.post(f"{URL}/accept", json={"key": "reading_level:3"})

    assert resp.status_code == 200
    assert resp.json()["readingLevel"] == 3
    assert (await client.get("/api/preferences")).json()["readingLevel"] == 3
    assert (await client.get(URL)).json() is None
    assert activity_repository.entries["user-a"][-1].agent == "AdaptLens"


async def test_accepting_a_suggestion_that_changed_meanwhile_is_a_409(client, signed_in):
    await simplify_at(client, 3)

    resp = await client.post(f"{URL}/accept", json={"key": "reading_level:7"})

    assert resp.status_code == 409
    assert (await client.get("/api/preferences")).json()["readingLevel"] == 5


async def test_dismissing_keeps_it_away(client, signed_in):
    await simplify_at(client, 3)

    assert (await client.post(f"{URL}/dismiss", json={"key": "reading_level:3"})).status_code == 204

    assert (await client.get(URL)).json() is None
    assert (await client.get("/api/preferences")).json()["readingLevel"] == 5


async def test_finishing_broken_down_tasks_without_their_steps_suggests_larger_steps(client, signed_in):
    for n in range(3):
        task = (
            await client.post("/api/tasks", json={"title": f"Task {n}", "steps": [{"title": "A"}, {"title": "B"}]})
        ).json()
        await client.patch(f"/api/tasks/{task['id']}", json={"completed": True})

    suggestion = (await client.get(URL)).json()

    assert (suggestion["preference"], suggestion["value"]) == ("stepSize", "large")


async def test_suggestions_are_per_user(client, signed_in):
    await simplify_at(client, 3)

    signed_in.user = "user-b"
    assert (await client.get(URL)).json() is None


async def test_suggestions_need_a_signed_in_user(client):
    assert (await client.get(URL)).status_code == 401
