"""Write the local settings files, ``backend/.env`` and ``frontend/.env.local``, from their examples.

Both get the same ``AUTH_TOKEN_SECRET`` (the Next.js server signs every API call with it), and the frontend a
fresh ``AUTH_SECRET``. A file that exists is never rewritten: settings it lacks are added at the end, with the
example's value, and the secret it already has is the one the other file gets.

    uv run python scripts/setup_local.py          # then put your free Groq key in backend/.env
    uv run python scripts/setup_local.py --fake   # or try it without one: the offline, scripted LLM
"""

import argparse
import secrets
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SHARED = "AUTH_TOKEN_SECRET"


def read_env(text: str) -> dict[str, str]:
    """The ``KEY=value`` lines of an env file; comments and blank lines are skipped."""
    values = {}
    for line in text.splitlines():
        key, sep, value = line.partition("=")
        if sep and not key.lstrip().startswith("#"):
            values[key.strip()] = value.strip()
    return values


def fill(example: str, values: dict[str, str]) -> str:
    """The example with each given key's value filled in; comments and every other line stay as they are."""
    lines = []
    for line in example.splitlines():
        key, sep, _ = line.partition("=")
        if sep and key in values:
            line = f"{key}={values[key]}"
        lines.append(line)
    return "\n".join(lines) + "\n"


def write(path: Path, example: Path, values: dict[str, str]) -> str:
    """Creates ``path`` from the example, or adds to it what it lacks. Says what it did, in one line."""
    filled = fill(example.read_text(), values)
    name = f"{path.parent.name}/{path.name}"
    if not path.exists():
        path.write_text(filled)
        return f"Wrote {name}."
    text = path.read_text()
    have = read_env(text)
    missing = {key: value for key, value in read_env(filled).items() if key not in have and value}
    if not missing:
        return f"{name} already has everything; left as it is."
    added = "".join(f"{key}={value}\n" for key, value in missing.items())
    path.write_text(text + ("" if text.endswith("\n") or not text else "\n") + added)
    return f"Added {', '.join(missing)} to {name}; nothing else changed."


def existing_secret(*paths: Path) -> str:
    for path in paths:
        if path.exists() and (secret := read_env(path.read_text()).get(SHARED)):
            return secret
    return ""


def setup(root: Path = ROOT, fake: bool = False) -> list[str]:
    """Writes or completes both files, and returns what to tell the user."""
    backend, frontend = root / "backend" / ".env", root / "frontend" / ".env.local"
    shared = existing_secret(backend, frontend) or secrets.token_urlsafe(32)
    backend_values = {SHARED: shared, **({"LLM_PROVIDER": "fake"} if fake else {})}
    report = [
        write(backend, root / "backend" / ".env.example", backend_values),
        write(frontend, root / "frontend" / ".env.example", {SHARED: shared, "AUTH_SECRET": secrets.token_urlsafe(32)}),
    ]
    if read_env(frontend.read_text()).get(SHARED) != read_env(backend.read_text()).get(SHARED):
        report.append(f"The two files have different {SHARED}s, so sign-in won't work: make them the same.")
    settings = read_env(backend.read_text())
    if settings.get("LLM_PROVIDER", "groq") in ("groq", "openai") and not settings.get("LLM_API_KEY"):
        report.append(
            "Next: put your free Groq key (https://console.groq.com/keys) in backend/.env as LLM_API_KEY, "
            "or run this again with --fake on a fresh backend/.env to try Pebble without one."
        )
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--fake", action="store_true", help="use the offline, scripted LLM (no key needed)")
    print("\n".join(setup(fake=parser.parse_args().fake)))
