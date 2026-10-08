"""The task endpoints over HTTP: shapes, validation, not-found, user isolation, and no database."""

import pytest
from icalendar import Calendar

from app.api.auth import get_current_user
from app.application.ports.llm import LLMUnavailableError
from app.application.ports.persistence import PersistenceError
from app.infrastructure.db.tasks import UnconfiguredTaskRepository

URL = "/api/tasks"


@pytest.fixture
def signed_in(app):
    """``signed_in.user = "..."`` switches the signed-in user."""

    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


async def add(client, **fields) -> dict:
    resp = await client.post(URL, json={"title": "Write the essay", **fields})
    assert resp.status_code == 201, resp.text
    return resp.json()


async def test_a_new_list_is_empty(client, signed_in):
    resp = await client.get(URL)

    assert resp.status_code == 200
    assert resp.json() == []


async def test_add_returns_the_task_with_defaults_and_ids(client, signed_in):
    task = await add(client, steps=[{"title": "Open the doc", "timeEstimate": "~5 min"}])

    assert task == {
        "id": task["id"],
        "title": "Write the essay",
        "timeEstimate": "",
        "tag": "project",
        "priority": "medium",
        "completed": False,
        "whyExplanation": "",
        "steps": [
            {"id": task["steps"][0]["id"], "title": "Open the doc", "timeEstimate": "~5 min", "completed": False}
        ],
        "due": None,
        "dueSetAt": None,
        "letGoAt": None,
    }
    assert (await client.get(URL)).json() == [task]


async def test_a_due_day_is_kept_with_when_it_was_chosen(client, signed_in):
    """8.3: the time-left bar starts when the day was chosen."""
    task = await add(client, due="2026-10-20")

    assert task["due"] == "2026-10-20"
    assert task["dueSetAt"] is not None
    assert (await client.get(URL)).json()[0]["due"] == "2026-10-20"


async def test_a_due_day_can_be_changed_and_removed(client, signed_in):
    task = await add(client)
    url = f"{URL}/{task['id']}"

    set_ = (await client.patch(url, json={"due": "2026-10-20"})).json()
    same = (await client.patch(url, json={"due": "2026-10-20", "title": "Renamed"})).json()
    untouched = (await client.patch(url, json={"title": "Again"})).json()
    cleared = (await client.patch(url, json={"due": None})).json()

    assert (set_["due"], same["dueSetAt"], untouched["due"]) == ("2026-10-20", set_["dueSetAt"], "2026-10-20")
    assert (cleared["due"], cleared["dueSetAt"]) == (None, None)


async def test_a_due_day_must_be_a_date(client, signed_in):
    task = await add(client)

    response = await client.patch(f"{URL}/{task['id']}", json={"due": "next week"})

    assert response.status_code == 422


async def test_tasks_are_listed_in_the_order_they_were_added(client, signed_in):
    for title in ("One", "Two", "Three"):
        await add(client, title=title)

    assert [t["title"] for t in (await client.get(URL)).json()] == ["One", "Two", "Three"]


@pytest.mark.parametrize(
    "body",
    [
        {},
        {"title": ""},
        {"title": "x", "tag": "homework"},
        {"title": "x", "priority": "urgent"},
        {"title": "x" * 501},
        {"title": "x", "steps": [{"title": ""}]},
    ],
    ids=["no-title", "empty-title", "unknown-tag", "unknown-priority", "long-title", "empty-step"],
)
async def test_add_validates_the_body(client, signed_in, body):
    assert (await client.post(URL, json=body)).status_code == 422


async def test_patch_changes_only_the_fields_sent(client, signed_in):
    task = await add(client, tag="study", whyExplanation="Due Friday.")

    resp = await client.patch(f"{URL}/{task['id']}", json={"completed": True, "priority": "high"})

    assert resp.status_code == 200
    assert resp.json() == {**task, "completed": True, "priority": "high"}


async def test_patch_ignores_null_fields(client, signed_in):
    task = await add(client)

    resp = await client.patch(f"{URL}/{task['id']}", json={"title": None})

    assert resp.json() == task


async def test_replace_steps_then_finish_them(client, signed_in):
    task = await add(client)
    resp = await client.put(f"{URL}/{task['id']}/steps", json={"steps": [{"title": "Outline"}, {"title": "Draft"}]})
    steps = resp.json()["steps"]
    assert [s["title"] for s in steps] == ["Outline", "Draft"]

    first = await client.patch(f"{URL}/{task['id']}/steps/{steps[0]['id']}", json={"completed": True})
    assert first.json()["completed"] is False

    last = await client.patch(f"{URL}/{task['id']}/steps/{steps[1]['id']}", json={"completed": True})
    assert last.status_code == 200
    assert last.json()["completed"] is True
    assert [s["completed"] for s in last.json()["steps"]] == [True, True]


async def test_delete_one_then_clear_all(client, signed_in):
    one = await add(client, title="One")
    await add(client, title="Two")

    assert (await client.delete(f"{URL}/{one['id']}")).status_code == 204
    assert [t["title"] for t in (await client.get(URL)).json()] == ["Two"]

    assert (await client.delete(URL)).status_code == 204
    assert (await client.get(URL)).json() == []


def other_users_requests(task: dict) -> list[tuple[str, str, dict | None]]:
    """Every request that names a task, aimed at ``task``."""
    task_url = f"{URL}/{task['id']}"
    step_url = f"{task_url}/steps/{task['steps'][0]['id']}"
    return [
        ("PATCH", task_url, {"completed": True}),
        ("PUT", f"{task_url}/steps", {"steps": []}),
        ("PATCH", step_url, {"completed": True}),
        ("DELETE", task_url, None),
        ("POST", f"{task_url}/let-go", None),
        ("DELETE", f"{task_url}/let-go", None),
    ]


@pytest.mark.parametrize(
    "index", range(6), ids=["patch-task", "put-steps", "patch-step", "delete-task", "let-go", "take-back"]
)
async def test_another_user_can_never_see_or_change_a_task(client, signed_in, index):
    task = await add(client, steps=[{"title": "Step"}])

    signed_in.user = "user-b"
    method, url, body = other_users_requests(task)[index]
    resp = await client.request(method, url, json=body)
    assert resp.status_code == 404
    assert resp.json() == {"detail": "Pebble couldn't find that on your list."}
    assert (await client.get(URL)).json() == []
    assert (await client.delete(URL)).status_code == 204

    signed_in.user = "user-a"
    assert (await client.get(URL)).json() == [task]


@pytest.mark.parametrize("task_id", ["00000000-0000-0000-0000-000000000000", "not-a-uuid"])
async def test_an_unknown_task_is_a_404(client, signed_in, task_id):
    assert (await client.patch(f"{URL}/{task_id}", json={"completed": True})).status_code == 404


async def test_an_unknown_step_is_a_404(client, signed_in):
    task = await add(client)

    resp = await client.patch(f"{URL}/{task['id']}/steps/missing", json={"completed": True})

    assert resp.status_code == 404


@pytest.mark.parametrize(("method", "url"), [("GET", URL), ("POST", URL), ("PATCH", f"{URL}/x"), ("DELETE", URL)])
async def test_tasks_need_a_signed_in_user(client, method, url):
    resp = await client.request(method, url, json={"title": "x"})

    assert resp.status_code == 401


async def test_without_a_database_tasks_answer_503(client, signed_in, container):
    container.task_repository = UnconfiguredTaskRepository()

    resp = await client.get(URL)

    assert resp.status_code == 503
    assert resp.json() == {"detail": "Pebble couldn't reach your saved tasks just now. Try again in a little while."}


async def test_a_database_outage_is_a_503(client, signed_in, task_repository):
    async def down(user_id):
        raise PersistenceError("connection refused")

    task_repository.list = down

    assert (await client.get(URL)).status_code == 503


async def test_reorder_the_list(client, signed_in):
    one, two, three = [await add(client, title=title) for title in ("One", "Two", "Three")]

    resp = await client.put(f"{URL}/order", json={"taskIds": [three["id"], one["id"], two["id"]]})

    assert resp.status_code == 200
    assert [t["title"] for t in resp.json()] == ["Three", "One", "Two"]
    assert [t["title"] for t in (await client.get(URL)).json()] == ["Three", "One", "Two"]


async def test_a_new_task_goes_last_after_a_reorder(client, signed_in):
    one, two = await add(client, title="One"), await add(client, title="Two")
    await client.put(f"{URL}/order", json={"taskIds": [two["id"], one["id"]]})

    await add(client, title="Three")

    assert [t["title"] for t in (await client.get(URL)).json()] == ["Two", "One", "Three"]


async def test_an_order_that_does_not_match_the_list_is_a_409_and_moves_nothing(client, signed_in):
    await add(client, title="One")
    two = await add(client, title="Two")

    resp = await client.put(f"{URL}/order", json={"taskIds": [two["id"]]})

    assert resp.status_code == 409
    assert resp.json() == {"detail": "Your list changed meanwhile. Pebble kept the order it had."}
    assert [t["title"] for t in (await client.get(URL)).json()] == ["One", "Two"]


async def test_another_users_task_cannot_be_put_in_an_order(client, signed_in):
    theirs = await add(client, title="Theirs")
    signed_in.user = "user-b"
    mine = await add(client, title="Mine")

    resp = await client.put(f"{URL}/order", json={"taskIds": [mine["id"], theirs["id"]]})

    assert resp.status_code == 409
    signed_in.user = "user-a"
    assert [t["title"] for t in (await client.get(URL)).json()] == ["Theirs"]


# --- Breaking a task down with CalmSense ----------------------------------------------------------------


async def test_breakdown_saves_calmsenses_steps_and_why(client, signed_in, llm):
    task = await add(client)
    llm.script(
        "CalmSense",
        {"steps": [{"title": "Open the doc", "timeEstimate": "~5 min"}], "whyExplanation": "One small start."},
    )
    llm.script("WhyBot", {"why": "It's morning, and your steps are medium."})

    resp = await client.post(f"{URL}/{task['id']}/breakdown", json={"timeOfDay": "morning"})

    assert resp.status_code == 200
    body = resp.json()
    assert [(s["title"], s["timeEstimate"], s["completed"]) for s in body["steps"]] == [
        ("Open the doc", "~5 min", False)
    ]
    # WhyBot's plain-language "why" (7.4), shown on the task's "Why?" card
    assert body["whyExplanation"] == "It's morning, and your steps are medium."
    assert (await client.get(URL)).json() == [body]


async def test_breakdown_of_another_users_task_is_a_404(client, signed_in, llm):
    task = await add(client)
    signed_in.user = "user-b"

    resp = await client.post(f"{URL}/{task['id']}/breakdown", json={})

    assert resp.status_code == 404
    assert llm.calls == []


async def test_breakdown_when_calmsense_cant_answer_is_a_gentle_503_and_nothing_changes(client, signed_in, llm):
    task = await add(client)
    llm.script("CalmSense", LLMUnavailableError("down"))

    resp = await client.post(f"{URL}/{task['id']}/breakdown", json={})

    assert resp.status_code == 503
    assert (await client.get(URL)).json() == [task]


async def test_removing_a_breakdown_undoes_it(client, signed_in, llm):
    task = await add(client, priority="high")
    await client.post(f"{URL}/{task['id']}/breakdown", json={})

    resp = await client.delete(f"{URL}/{task['id']}/breakdown")

    assert resp.status_code == 200
    assert resp.json() == {**task, "steps": [], "whyExplanation": ""}
    assert (await client.get(URL)).json() == [resp.json()]


async def test_removing_a_breakdown_of_another_users_task_is_a_404(client, signed_in):
    task = await add(client)
    signed_in.user = "user-b"

    assert (await client.delete(f"{URL}/{task['id']}/breakdown")).status_code == 404


# --- BridgeBot: the plan as a calendar file (7.7) ------------------------------------------------------------


async def test_the_calendar_file_has_the_open_steps_back_to_back_from_the_start(client, signed_in, activity_repository):
    steps = [{"title": "Outline", "timeEstimate": "~10 min"}, {"title": "Draft", "timeEstimate": "~25 min"}]
    task = await add(client, steps=steps)

    resp = await client.get(f"{URL}/{task['id']}/calendar.ics", params={"start": "2026-10-06T11:15:00+02:00"})

    assert resp.status_code == 200
    assert resp.headers["content-type"].startswith("text/calendar")
    events = Calendar.from_ical(resp.content).walk("VEVENT")
    assert [str(e["summary"]) for e in events] == ["Outline", "Draft"]
    assert events[0].decoded("dtstart").isoformat() == "2026-10-06T09:15:00+00:00"
    assert events[1].decoded("dtend").isoformat() == "2026-10-06T09:50:00+00:00"
    assert activity_repository.entries["user-a"][-1].agent == "BridgeBot"


async def test_a_start_time_without_an_offset_is_a_422(client, signed_in):
    task = await add(client)

    resp = await client.get(f"{URL}/{task['id']}/calendar.ics", params={"start": "2026-10-06T11:15:00"})

    assert resp.status_code == 422


async def test_another_users_calendar_file_is_a_404(client, signed_in):
    task = await add(client)
    signed_in.user = "user-b"

    assert (await client.get(f"{URL}/{task['id']}/calendar.ics")).status_code == 404


async def test_letting_a_task_go_takes_it_off_the_list_and_keeps_it(client, signed_in, task_repository):
    """8.4: off the list, kept as the record, and taken back on undo, where it was."""
    first, second = await add(client, title="Essay"), await add(client, title="Walk")

    let_go = await client.post(f"{URL}/{first['id']}/let-go")

    assert let_go.status_code == 200
    assert let_go.json()["letGoAt"] is not None
    assert [t["title"] for t in (await client.get(URL)).json()] == ["Walk"]
    assert (await task_repository.get("user-a", first["id"])).let_go_at is not None
    # The list can be reordered without it
    assert (await client.put(f"{URL}/order", json={"taskIds": [second["id"]]})).status_code == 200

    back = await client.delete(f"{URL}/{first['id']}/let-go")

    assert back.json()["letGoAt"] is None
    assert [t["title"] for t in (await client.get(URL)).json()] == ["Essay", "Walk"]


async def test_a_finished_task_is_not_let_go(client, signed_in):
    task = await add(client, completed=True)

    response = await client.post(f"{URL}/{task['id']}/let-go")

    assert response.status_code == 409
    assert response.json()["detail"] == "That one is already finished, so there's nothing to let go."


@pytest.mark.parametrize("method", ["post", "delete"])
async def test_letting_go_of_an_unknown_task_is_not_found(client, signed_in, method):
    response = await getattr(client, method)(f"{URL}/00000000-0000-0000-0000-000000000000/let-go")

    assert response.status_code == 404
