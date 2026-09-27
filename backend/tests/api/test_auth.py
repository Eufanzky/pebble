"""Today's Entra ID auth (replaced by Auth.js in 4.3): what gets a 401, and the DEV_MODE bypass."""

import pytest

from app.infrastructure.config import settings

URL = "/api/agents/motivate"


@pytest.fixture(autouse=True)
def real_auth(monkeypatch):
    monkeypatch.setattr(settings, "dev_mode", False)


async def test_missing_token_is_a_401(client, llm):
    resp = await client.post(URL, json={})

    assert resp.status_code == 401
    assert resp.json() == {"detail": "Missing authorization header"}
    assert llm.calls == []


@pytest.mark.parametrize("token", ["not-a-jwt", "a.b.c"])
async def test_malformed_token_is_a_401(client, llm, token):
    resp = await client.post(URL, json={}, headers={"Authorization": f"Bearer {token}"})

    assert resp.status_code == 401
    assert llm.calls == []


async def test_dev_mode_skips_sign_in(client, llm, monkeypatch):
    monkeypatch.setattr(settings, "dev_mode", True)

    resp = await client.post(URL, json={})

    assert resp.status_code == 200


async def test_health_needs_no_token(client):
    assert (await client.get("/api/health")).status_code == 200
