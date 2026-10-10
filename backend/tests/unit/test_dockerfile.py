"""The backend image (roadmap 10.1): what goes in, and what its health check asks.

Docker isn't needed here; CI builds and runs the image (the Docker and E2E jobs).
"""

import re
from pathlib import Path

from app.main import app

BACKEND = Path(__file__).resolve().parents[2]
DOCKERFILE = (BACKEND / "Dockerfile").read_text()
IGNORED = {
    line.strip()
    for line in (BACKEND / ".dockerignore").read_text().splitlines()
    if line.strip() and not line.startswith("#")
}


def test_secrets_and_tests_stay_out_of_the_image():
    assert {".env", ".env.*", ".venv", "tests"} <= IGNORED


def test_dependencies_come_from_the_lock_file_without_the_dev_group():
    assert "uv sync --locked --no-dev" in DOCKERFILE


def test_the_health_check_asks_a_route_that_exists():
    healthcheck = re.search(r"HEALTHCHECK[^\n]*\\\n\s*CMD (.+)", DOCKERFILE)
    assert healthcheck, "the Dockerfile has a HEALTHCHECK"
    path = re.search(r"\}(/api/[\w/]+)", healthcheck.group(1)).group(1)
    assert path in app.openapi()["paths"]


def test_it_migrates_before_serving_and_listens_on_the_hosts_port():
    cmd = DOCKERFILE.split("\nCMD ")[-1]
    assert cmd.index("alembic upgrade head") < cmd.index("uvicorn app.main:app")
    assert '--port \\"$PORT\\"' in cmd
    assert "USER pebble" in DOCKERFILE  # not root
