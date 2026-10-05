"""``POST /api/agents/simplify``: SimplifyCore called directly."""

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
    llm.script("SimplifyCore", SIMPLIFY_REPLY)
    llm.script("WhyBot", {"why": "You chose reading level 2."})

    resp = await client.post("/api/agents/simplify", json={"text": "The form must be submitted.", "readingLevel": 2})

    assert resp.status_code == 200
    assert resp.json() == {
        "simplified": "Hand in the form by Friday.",
        "extractedTasks": [{"title": "Hand in the form", "timeEstimate": "~10 min", "tag": "project"}],
        "tags": ["forms"],
        "whyExplanation": "You chose reading level 2.",
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


async def test_llm_down_is_a_gentle_503(client, llm):
    llm.script("SimplifyCore", LLMUnavailableError("down"))

    resp = await client.post("/api/agents/simplify", json={"text": "x"})

    assert resp.status_code == 503
    assert resp.json() == {"detail": UNAVAILABLE}


async def test_simplify_refuses_text_longer_than_the_llm_can_take(client, llm):
    resp = await client.post("/api/agents/simplify", json={"text": "x" * 12_001})

    assert resp.status_code == 422
    assert llm.calls == []
