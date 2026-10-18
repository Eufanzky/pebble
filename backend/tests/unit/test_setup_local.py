"""``scripts/setup_local.py`` (10.5): both settings files share one secret, and nothing that exists is rewritten."""

import importlib.util
import shutil
from pathlib import Path

import pytest

REPO = Path(__file__).resolve().parents[3]
spec = importlib.util.spec_from_file_location("setup_local", REPO / "backend" / "scripts" / "setup_local.py")
setup_local = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup_local)
read_env = setup_local.read_env


@pytest.fixture
def root(tmp_path):
    """A repo with only the two real example files."""
    for part in ("backend", "frontend"):
        (tmp_path / part).mkdir()
        shutil.copy(REPO / part / ".env.example", tmp_path / part / ".env.example")
    return tmp_path


def backend_env(root):
    return root / "backend" / ".env"


def frontend_env(root):
    return root / "frontend" / ".env.local"


def test_a_fresh_clone_gets_both_files_with_one_shared_secret(root):
    report = setup_local.setup(root)

    backend, frontend = read_env(backend_env(root).read_text()), read_env(frontend_env(root).read_text())
    assert len(backend["AUTH_TOKEN_SECRET"]) >= 32
    assert backend["AUTH_TOKEN_SECRET"] == frontend["AUTH_TOKEN_SECRET"]
    assert frontend["AUTH_SECRET"] and frontend["AUTH_SECRET"] != frontend["AUTH_TOKEN_SECRET"]
    assert report[:2] == ["Wrote backend/.env.", "Wrote frontend/.env.local."]
    assert "LLM_API_KEY" in report[2]


def test_the_files_keep_the_examples_comments_and_defaults(root):
    setup_local.setup(root)

    backend = backend_env(root).read_text()
    assert "# The only required setting is an LLM." in backend
    assert read_env(backend)["DATABASE_URL"] == "postgresql+asyncpg://pebble:pebble@localhost:5432/pebble"
    frontend = read_env(frontend_env(root).read_text())
    assert frontend["AUTH_DEV_LOGIN"] == "true"
    assert frontend["AUTH_TRUST_HOST"] == "true"  # a local `next start` can sign in (A-039)


def test_fake_needs_no_key(root):
    report = setup_local.setup(root, fake=True)

    assert read_env(backend_env(root).read_text())["LLM_PROVIDER"] == "fake"
    assert not any("LLM_API_KEY" in line for line in report)


def test_an_existing_file_is_never_rewritten_only_completed(root):
    old = "LLM_API_KEY=gsk_mine\nLLM_PROVIDER=openai\nAUTH_TOKEN_SECRET=kept-secret\n"
    backend_env(root).write_text(old)

    report = setup_local.setup(root)

    backend = backend_env(root).read_text()
    assert backend.startswith(old)
    assert read_env(backend)["LLM_PROVIDER"] == "openai"
    assert read_env(backend)["DATABASE_URL"].startswith("postgresql+asyncpg://")
    assert "Added" in report[0] and "nothing else changed" in report[0]
    # The new frontend file signs with the secret the backend already has
    assert read_env(frontend_env(root).read_text())["AUTH_TOKEN_SECRET"] == "kept-secret"


def test_a_backend_file_without_the_secret_gets_the_frontends(root):
    backend_env(root).write_text("LLM_API_KEY=gsk_mine")  # no newline at the end
    frontend_env(root).write_text("AUTH_SECRET=a\nAUTH_TOKEN_SECRET=from-the-frontend\n")

    setup_local.setup(root)

    backend = backend_env(root).read_text()
    assert backend.startswith("LLM_API_KEY=gsk_mine\n")
    assert read_env(backend)["AUTH_TOKEN_SECRET"] == "from-the-frontend"


def test_running_it_twice_changes_nothing(root):
    setup_local.setup(root)
    before = backend_env(root).read_text(), frontend_env(root).read_text()

    report = setup_local.setup(root)

    assert (backend_env(root).read_text(), frontend_env(root).read_text()) == before
    assert report[0] == "backend/.env already has everything; left as it is."


def test_different_secrets_are_pointed_out_not_changed(root):
    backend_env(root).write_text("LLM_API_KEY=k\nAUTH_TOKEN_SECRET=one\n")
    frontend_env(root).write_text("AUTH_TOKEN_SECRET=two\n")

    report = setup_local.setup(root)

    assert read_env(frontend_env(root).read_text())["AUTH_TOKEN_SECRET"] == "two"
    assert any("different AUTH_TOKEN_SECRETs" in line for line in report)


def test_read_env_skips_comments_and_blank_lines():
    assert read_env("# A=1\n\nB = 2\nC=\nnot a setting\n") == {"B": "2", "C": ""}
