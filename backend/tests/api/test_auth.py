"""Sign-in: the backend trusts only a short-lived token signed by the Next.js server (``api/auth.py``)."""

import time

import pytest
from jose import jwt

from app.api.auth import ALGORITHM, AUDIENCE, ISSUER
from app.infrastructure.config import settings

URL = "/api/preferences"


def token(secret: str, **overrides) -> str:
    now = int(time.time())
    claims = {"sub": "github:42", "iss": ISSUER, "aud": AUDIENCE, "iat": now, "exp": now + 300, **overrides}
    claims = {k: v for k, v in claims.items() if v is not None}
    return jwt.encode(claims, secret, algorithm=ALGORITHM)


def bearer(value: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {value}"}


async def test_a_valid_token_is_the_user(client, auth_secret, preferences_repository):
    resp = await client.patch(URL, json={"calmMode": True}, headers=bearer(token(auth_secret)))

    assert resp.status_code == 200
    assert preferences_repository.saved["github:42"]["calm_mode"] is True


async def test_missing_token_is_a_401(client, llm):
    resp = await client.post("/api/agents/motivate", json={})

    assert resp.status_code == 401
    assert resp.json() == {"detail": "Please sign in first."}
    assert resp.headers["WWW-Authenticate"] == "Bearer"
    assert llm.calls == []


@pytest.mark.parametrize(
    "overrides",
    [
        {"exp": int(time.time()) - 10},
        {"aud": "someone-else"},
        {"iss": "someone-else"},
        {"sub": None},
        {"sub": " "},
        {"exp": None},
        {"iat": None},
    ],
    ids=["expired", "wrong-audience", "wrong-issuer", "no-subject", "blank-subject", "no-expiry", "no-issued-at"],
)
async def test_a_bad_token_is_a_401(client, auth_secret, overrides):
    resp = await client.get(URL, headers=bearer(token(auth_secret, **overrides)))

    assert resp.status_code == 401


async def test_a_token_signed_with_another_secret_is_a_401(client):
    assert (await client.get(URL, headers=bearer(token("another-secret-that-is-32-bytes-long!")))).status_code == 401


async def test_an_unsigned_token_is_a_401(client):
    unsigned = jwt.encode({"sub": "github:42"}, "", algorithm="HS256").rsplit(".", 1)[0] + "."
    assert (await client.get(URL, headers=bearer(unsigned))).status_code == 401


@pytest.mark.parametrize("value", ["not-a-jwt", "a.b.c"])
async def test_a_malformed_token_is_a_401(client, value):
    assert (await client.get(URL, headers=bearer(value))).status_code == 401


async def test_without_a_secret_sign_in_is_unavailable(client, monkeypatch, auth_secret):
    monkeypatch.setattr(settings, "auth_token_secret", "")

    resp = await client.get(URL, headers=bearer(token(auth_secret)))

    assert resp.status_code == 503
    assert resp.json() == {"detail": "Sign-in isn't set up yet."}


async def test_health_needs_no_token(client):
    assert (await client.get("/api/health")).status_code == 200
