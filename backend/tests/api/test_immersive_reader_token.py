"""``GET /api/documents/immersive-reader/token``: the optional Azure reader's token."""

from app.api.auth import get_current_user
from app.application.ports.reader import ReaderToken


class StubReader:
    async def get_token(self) -> ReaderToken:
        return ReaderToken("abc", "pebble")


async def test_immersive_reader_token(app, client, container):
    app.dependency_overrides[get_current_user] = lambda: "user-1"
    container.reader = StubReader()

    resp = await client.get("/api/documents/immersive-reader/token")

    assert resp.json() == {"token": "abc", "subdomain": "pebble"}


async def test_immersive_reader_unconfigured_is_a_503(app, client):
    app.dependency_overrides[get_current_user] = lambda: "user-1"

    resp = await client.get("/api/documents/immersive-reader/token")

    assert resp.status_code == 503
