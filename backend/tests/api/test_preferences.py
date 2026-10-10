"""``/api/preferences`` over HTTP."""

import pytest

from app.api.auth import get_current_user
from app.infrastructure.db.preferences import UnconfiguredPreferencesRepository

URL = "/api/preferences"
DEFAULTS = {
    "readingLevel": 5,
    "stepSize": "medium",
    "reduceAnimations": False,
    "calmMode": False,
    "pebbleColor": "lavender",
    "pebblePersonality": "gentle",
    "pebbleModel": "chonky-plus",
    "reminderTime": "",
    "reminderNotifications": False,
}


@pytest.fixture
def signed_in(app):
    class SignedIn:
        user = "user-a"

    app.dependency_overrides[get_current_user] = lambda: SignedIn.user
    return SignedIn


async def test_a_new_account_gets_the_defaults(client, signed_in):
    resp = await client.get(URL)

    assert resp.status_code == 200
    assert resp.json() == DEFAULTS


async def test_patch_changes_only_what_was_sent(client, signed_in):
    resp = await client.patch(URL, json={"calmMode": True, "pebbleModel": "mochi"})

    assert resp.status_code == 200
    assert resp.json() == {**DEFAULTS, "calmMode": True, "pebbleModel": "mochi"}
    assert (await client.get(URL)).json() == resp.json()


@pytest.mark.parametrize(
    "body",
    [{"readingLevel": 0}, {"readingLevel": 11}, {"stepSize": "huge"}, {"pebbleColor": "red"}, {"theme": "light"}],
    ids=["level-0", "level-11", "step-size", "color", "unknown-field"],
)
async def test_patch_validates(client, signed_in, body):
    assert (await client.patch(URL, json=body)).status_code == 422


async def test_users_have_their_own_preferences(client, signed_in):
    await client.patch(URL, json={"calmMode": True})

    signed_in.user = "user-b"
    assert (await client.get(URL)).json() == DEFAULTS


async def test_preferences_need_a_signed_in_user(client):
    assert (await client.get(URL)).status_code == 401
    assert (await client.patch(URL, json={})).status_code == 401


async def test_without_a_database_preferences_answer_503(client, signed_in, container):
    container.preferences_repository = UnconfiguredPreferencesRepository()

    assert (await client.get(URL)).status_code == 503


async def test_reminders_are_off_until_set_and_can_be_turned_off_again(client, signed_in):
    """8.6: no reminder by default; a time turns it on, an empty time turns it off."""
    url = "/api/preferences"
    saved = (await client.get(url)).json()
    assert (saved["reminderTime"], saved["reminderNotifications"]) == ("", False)

    on = (await client.patch(url, json={"reminderTime": "14:30", "reminderNotifications": True})).json()
    off = (await client.patch(url, json={"reminderTime": ""})).json()

    assert (on["reminderTime"], on["reminderNotifications"]) == ("14:30", True)
    assert off["reminderTime"] == ""


@pytest.mark.parametrize("time", ["25:00", "9:30", "14:60", "noon", "14:30:00"])
async def test_a_reminder_time_must_be_hh_mm(client, signed_in, time):
    response = await client.patch("/api/preferences", json={"reminderTime": time})

    assert response.status_code == 422
