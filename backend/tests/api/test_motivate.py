"""``POST /api/agents/motivate``: PebbleVoice called directly."""

import pytest

from app.api.auth import get_current_user
from app.api.errors import UNAVAILABLE
from app.application.ports.llm import LLMUnavailableError


@pytest.fixture(autouse=True)
def signed_in(app):
    app.dependency_overrides[get_current_user] = lambda: "user-1"


async def test_motivate_returns_a_message_and_mood(client, llm):
    llm.script("PebbleVoice", {"message": "You finished 2 things today.", "mood": "excited"})

    resp = await client.post(
        "/api/agents/motivate", json={"tasksCompleted": 2, "tasksTotal": 3, "recentTaskTitles": ["Mail a@b.io"]}
    )

    assert resp.status_code == 200
    assert resp.json() == {"message": "You finished 2 things today.", "mood": "excited"}
    assert "a@b.io" not in llm.sent_text()


async def test_unsafe_motivation_is_a_422(client, llm, safety):
    llm.script("PebbleVoice", {"message": "harmful", "mood": "happy"})
    safety.flag("harmful")

    resp = await client.post("/api/agents/motivate", json={})

    assert resp.status_code == 422


async def test_llm_down_is_a_gentle_503(client, llm):
    llm.script("PebbleVoice", LLMUnavailableError("down"))

    resp = await client.post("/api/agents/motivate", json={})

    assert resp.status_code == 503
    assert resp.json() == {"detail": UNAVAILABLE}
