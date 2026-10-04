"""``/api/stats``: progress that only adds up, over HTTP."""

import pytest

from app.api.auth import get_current_user
from app.infrastructure.db.progress import UnconfiguredProgressRepository

URL = "/api/stats"


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


async def test_a_new_account_has_quiet_days_and_zero_totals(client, signed_in):
    resp = await client.get(URL, params={"days": 7, "tz": "Europe/Berlin"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["totals"] == {"tasks": 0, "steps": 0, "focusMinutes": 0}
    assert body["allTime"] == body["totals"]
    assert body["byTag"] == {"study": 0, "communication": 0, "project": 0, "wellbeing": 0}
    assert len(body["days"]) == 7
    assert body["days"][-1]["date"] == body["end"]


async def test_finished_tasks_steps_and_focus_add_up(client, signed_in):
    task = (
        await client.post(
            "/api/tasks", json={"title": "Read", "tag": "study", "steps": [{"title": "Skim"}, {"title": "Read"}]}
        )
    ).json()
    for step in task["steps"]:
        await client.patch(f"/api/tasks/{task['id']}/steps/{step['id']}", json={"completed": True})
    walk = (await client.post("/api/tasks", json={"title": "Walk", "tag": "wellbeing"})).json()
    await client.patch(f"/api/tasks/{walk['id']}", json={"completed": True})
    assert (await client.post(f"{URL}/focus", json={"minutes": 25})).status_code == 204

    body = (await client.get(URL)).json()

    assert body["totals"] == {"tasks": 2, "steps": 2, "focusMinutes": 25}
    assert body["byTag"]["study"] == 1
    assert body["byTag"]["wellbeing"] == 1
    assert body["days"][-1] == {"date": body["end"], "tasks": 2, "steps": 2, "focusMinutes": 25}


async def test_unticking_or_deleting_never_takes_progress_back(client, signed_in):
    walk = (await client.post("/api/tasks", json={"title": "Walk"})).json()
    await client.patch(f"/api/tasks/{walk['id']}", json={"completed": True})

    await client.patch(f"/api/tasks/{walk['id']}", json={"completed": False})
    await client.delete(f"/api/tasks/{walk['id']}")

    assert (await client.get(URL)).json()["allTime"]["tasks"] == 1


async def test_progress_is_per_user(client, signed_in):
    await client.post(f"{URL}/focus", json={"minutes": 25})

    signed_in.user = "user-b"

    assert (await client.get(URL)).json()["allTime"]["focusMinutes"] == 0


@pytest.mark.parametrize(
    "params",
    [{"days": 0}, {"days": 367}, {"tz": "Mars/Olympus"}, {"tz": "../../etc"}],
    ids=["0", "367", "zone", "path"],
)
async def test_the_range_and_time_zone_are_checked(client, signed_in, params):
    assert (await client.get(URL, params=params)).status_code == 422


@pytest.mark.parametrize("minutes", [0, 181, "a lot"])
async def test_a_focus_session_is_1_to_180_minutes(client, signed_in, minutes):
    assert (await client.post(f"{URL}/focus", json={"minutes": minutes})).status_code == 422


async def test_stats_need_a_signed_in_user(client):
    assert (await client.get(URL)).status_code == 401
    assert (await client.post(f"{URL}/focus", json={"minutes": 25})).status_code == 401


async def test_without_a_database_stats_answer_503(client, signed_in, container):
    container.progress_repository = UnconfiguredProgressRepository()

    assert (await client.get(URL)).status_code == 503
    assert (await client.post(f"{URL}/focus", json={"minutes": 25})).status_code == 503
