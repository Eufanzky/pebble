"""``POST /api/agents/simplify`` and ``/motivate``: SimplifyCore and PebbleVoice called directly."""

import pytest

from app.api.auth import get_current_user
from app.api.errors import UNAVAILABLE
from app.application.ports.llm import LLMUnavailableError

SIMPLIFY_REPLY = {
    "simplified": "Hand in the form by Friday.",
    "extractedTasks": [{"title": "Hand in the form", "timeEstimate": "~10 min", "tag": "homework"}],
    "tags": ["forms"],
    "whyExplanation": "I kept only the action.",
}


@pytest.fixture(autouse=True)
def signed_in(app):
    app.dependency_overrides[get_current_user] = lambda: "user-1"


async def test_simplify_returns_the_simpler_text_tasks_and_groundedness(client, llm):
    llm.script("simplify", SIMPLIFY_REPLY)

    resp = await client.post("/api/agents/simplify", json={"text": "The form must be submitted.", "readingLevel": 2})

    assert resp.status_code == 200
    assert resp.json() == {
        "simplified": "Hand in the form by Friday.",
        "extractedTasks": [{"title": "Hand in the form", "timeEstimate": "~10 min", "tag": "project"}],
        "tags": ["forms"],
        "whyExplanation": "I kept only the action.",
        "groundedness": {"grounded": True, "ungroundedPercentage": 0.0},
    }
    assert llm.calls[0].user_message.startswith("Target reading level: 2/10")


async def test_simplify_screens_the_input(client, llm, safety):
    safety.flag("hurt")

    resp = await client.post("/api/agents/simplify", json={"text": "hurt"})

    assert resp.status_code == 422
    assert llm.calls == []


async def test_simplify_rejects_a_bad_reading_level(client, llm):
    resp = await client.post("/api/agents/simplify", json={"text": "x", "readingLevel": 11})

    assert resp.status_code == 422
    assert llm.calls == []


async def test_motivate_returns_a_message_and_mood(client, llm):
    llm.script("motivate", {"message": "You finished 2 things today.", "mood": "excited"})

    resp = await client.post(
        "/api/agents/motivate", json={"tasksCompleted": 2, "tasksTotal": 3, "recentTaskTitles": ["Mail a@b.io"]}
    )

    assert resp.status_code == 200
    assert resp.json() == {"message": "You finished 2 things today.", "mood": "excited"}
    assert "a@b.io" not in llm.sent_text()


async def test_unsafe_motivation_is_a_422(client, llm, safety):
    llm.script("motivate", {"message": "harmful", "mood": "happy"})
    safety.flag("harmful")

    resp = await client.post("/api/agents/motivate", json={})

    assert resp.status_code == 422


@pytest.mark.parametrize("url, body", [("/api/agents/simplify", {"text": "x"}), ("/api/agents/motivate", {})])
async def test_llm_down_is_a_gentle_503(client, llm, url, body):
    llm.script("simplify", LLMUnavailableError("down"))
    llm.script("motivate", LLMUnavailableError("down"))

    resp = await client.post(url, json=body)

    assert resp.status_code == 503
    assert resp.json() == {"detail": UNAVAILABLE}
