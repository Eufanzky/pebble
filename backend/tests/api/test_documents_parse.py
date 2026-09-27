"""``POST /api/documents/parse``: read an upload's text in memory, with no Azure service."""

from pathlib import Path

import pytest

from app.api.auth import get_current_user_id
from app.application.documents import MAX_DOCUMENT_BYTES

FIXTURES = Path(__file__).parents[1] / "fixtures" / "documents"
URL = "/api/documents/parse"


@pytest.fixture(autouse=True)
def signed_in(app):
    app.dependency_overrides[get_current_user_id] = lambda: "user-1"


def upload(name: str, content: bytes | None = None, content_type: str = "application/octet-stream"):
    return {"file": (name, content if content is not None else (FIXTURES / name).read_bytes(), content_type)}


@pytest.mark.parametrize(
    ("name", "expected"),
    [
        ("syllabus.pdf", {"title": "syllabus.pdf", "type": "academic", "pages": 2}),
        ("meeting-notes.docx", {"title": "meeting-notes.docx", "type": "meeting", "pages": 1}),
        ("notes.txt", {"title": "notes.txt", "type": "meeting", "pages": 1}),
    ],
)
async def test_parses_each_format(client, name, expected):
    resp = await client.post(URL, files=upload(name))

    assert resp.status_code == 200
    body = resp.json()
    assert {k: body[k] for k in expected} == expected
    assert body["text"]


@pytest.mark.parametrize(
    ("name", "status"),
    [("corrupt.pdf", 422), ("locked.pdf", 422), ("corrupt.docx", 422), ("scan.pdf", 422)],
)
async def test_unusable_files_get_a_clear_message(client, name, status):
    resp = await client.post(URL, files=upload(name))

    assert resp.status_code == status
    assert name in resp.json()["detail"]


async def test_unsupported_format_is_a_415(client):
    resp = await client.post(URL, files=upload("photo.png", b"\x89PNG"))

    assert resp.status_code == 415
    assert "PDF, Word (.docx) or text" in resp.json()["detail"]


async def test_too_large_is_a_413(client):
    resp = await client.post(URL, files=upload("big.txt", b"a" * (MAX_DOCUMENT_BYTES + 1)))

    assert resp.status_code == 413


async def test_no_file_is_a_422(client):
    assert (await client.post(URL)).status_code == 422
