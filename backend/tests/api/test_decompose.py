"""``POST /api/agents/decompose``: CalmSense called directly, through the same safety gate."""

import pytest

from app.api.auth import get_current_user
from app.api.errors import UNAVAILABLE
from app.application.ports.llm import LLMTimeoutError

URL = "/api/agents/decompose"
REPLY = {"steps": [{"title": "Open the file", "timeEstimate": "~5 min"}], "whyExplanation": "Small first."}


@pytest.fixture(autouse=True)
def signed_in(app):
    app.dependency_overrides[get_current_user] = lambda: "user-1"


async def test_returns_the_steps(client, llm):
    llm.script("CalmSense", REPLY)

    resp = await client.post(URL, json={"taskTitle": "Write essay", "stepSize": "small"})

    assert resp.status_code == 200
    assert resp.json() == REPLY
    assert "User's preferred step size: small" in llm.calls[0].user_message


async def test_input_is_screened_and_redacted(client, llm, safety):
    llm.script("CalmSense", REPLY)

    await client.post(URL, json={"taskTitle": "Email sam@example.com"})

    assert safety.shielded == ["Email sam@example.com"]
    assert "sam@example.com" not in llm.sent_text()


async def test_unsafe_input_is_a_422(client, llm, safety):
    safety.flag("hurt")

    resp = await client.post(URL, json={"taskTitle": "hurt"})

    assert resp.status_code == 422
    assert llm.calls == []


async def test_unsafe_output_is_a_422(client, llm, safety):
    llm.script("CalmSense", REPLY)
    safety.flag("Open the file")

    resp = await client.post(URL, json={"taskTitle": "Essay"})

    assert resp.status_code == 422
    assert resp.json()["detail"].startswith("Content flagged by safety filter.")


@pytest.mark.parametrize("reply", [LLMTimeoutError("slow"), "not json"], ids=["timeout", "malformed"])
async def test_llm_problems_are_a_gentle_503(client, llm, reply):
    llm.script("CalmSense", reply)

    resp = await client.post(URL, json={"taskTitle": "Essay"})

    assert resp.status_code == 503
    assert resp.json() == {"detail": UNAVAILABLE}
