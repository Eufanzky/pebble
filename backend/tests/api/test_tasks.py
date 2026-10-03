"""The task endpoints over HTTP: shapes, validation, not-found, user isolation, and no database."""

import pytest

from app.api.auth import get_current_user
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
    task = await add(client, subtasks=[{"title": "Open the doc", "timeEstimate": "~5 min"}])

    assert task == {
        "id": task["id"],
        "title": "Write the essay",
        "timeEstimate": "",
        "tag": "project",
        "priority": "medium",
        "completed": False,
        "whyExplanation": "",
        "subtasks": [
            {"id": task["subtasks"][0]["id"], "title": "Open the doc", "timeEstimate": "~5 min", "completed": False}
        ],
    }
    assert (await client.get(URL)).json() == [task]


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
        {"title": "x", "subtasks": [{"title": ""}]},
    ],
    ids=["no-title", "empty-title", "unknown-tag", "unknown-priority", "long-title", "empty-subtask"],
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


async def test_replace_subtasks_then_finish_them(client, signed_in):
    task = await add(client)
    resp = await client.put(
        f"{URL}/{task['id']}/subtasks", json={"subtasks": [{"title": "Outline"}, {"title": "Draft"}]}
    )
    steps = resp.json()["subtasks"]
    assert [s["title"] for s in steps] == ["Outline", "Draft"]

    first = await client.patch(f"{URL}/{task['id']}/subtasks/{steps[0]['id']}", json={"completed": True})
    assert first.json()["completed"] is False

    last = await client.patch(f"{URL}/{task['id']}/subtasks/{steps[1]['id']}", json={"completed": True})
    assert last.status_code == 200
    assert last.json()["completed"] is True
    assert [s["completed"] for s in last.json()["subtasks"]] == [True, True]


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
    step_url = f"{task_url}/subtasks/{task['subtasks'][0]['id']}"
    return [
        ("PATCH", task_url, {"completed": True}),
        ("PUT", f"{task_url}/subtasks", {"subtasks": []}),
        ("PATCH", step_url, {"completed": True}),
        ("DELETE", task_url, None),
    ]


@pytest.mark.parametrize("index", range(4), ids=["patch-task", "put-subtasks", "patch-subtask", "delete-task"])
async def test_another_user_can_never_see_or_change_a_task(client, signed_in, index):
    task = await add(client, subtasks=[{"title": "Step"}])

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


async def test_an_unknown_subtask_is_a_404(client, signed_in):
    task = await add(client)

    resp = await client.patch(f"{URL}/{task['id']}/subtasks/missing", json={"completed": True})

    assert resp.status_code == 404


@pytest.mark.parametrize(
    ("method", "url"), [("GET", URL), ("POST", URL), ("PATCH", f"{URL}/x"), ("DELETE", URL)]
)
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
