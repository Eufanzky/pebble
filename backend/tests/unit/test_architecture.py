"""The dependency rule of the clean architecture (backend README, specs/tech-stack.md).

    api -> application -> domain;  infrastructure -> application, domain

``domain`` is pure Python. ``application`` sees only ``domain``. ``infrastructure``
implements application ports and never reaches into ``api``. ``api`` may import
anything: it holds the wiring. ``app.main`` is the composition root.
"""

import ast
import sys
from pathlib import Path

import pytest

APP = Path(__file__).resolve().parents[2] / "app"
STDLIB = set(sys.stdlib_module_names)

# Third-party packages the application layer may use: none today.
APPLICATION_THIRD_PARTY: set[str] = set()


def modules(layer: str) -> list[Path]:
    return sorted((APP / layer).rglob("*.py"))


def imports(path: Path) -> list[str]:
    """Every module imported by ``path``, absolute (relative imports resolved against ``app``)."""
    names = []
    for node in ast.walk(ast.parse(path.read_text(), filename=str(path))):
        if isinstance(node, ast.Import):
            names.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom):
            if node.level:
                package = path.relative_to(APP.parent).with_suffix("").parts[: -node.level]
                names.append(".".join([*package, node.module or ""]).rstrip("."))
            else:
                names.append(node.module or "")
    return names


def violations(layer: str, allowed_project: tuple[str, ...], allowed_third_party: set[str] | None) -> list[str]:
    found = []
    for path in modules(layer):
        for name in imports(path):
            top = name.split(".")[0]
            if top == "app":
                if not name.startswith(allowed_project):
                    found.append(f"{path.relative_to(APP.parent)} imports {name}")
            elif top not in STDLIB and top != "__future__":
                if allowed_third_party is not None and top not in allowed_third_party:
                    found.append(f"{path.relative_to(APP.parent)} imports third-party {name}")
    return found


@pytest.mark.parametrize("layer", ["domain", "application", "infrastructure", "api"])
def test_layer_exists(layer):
    assert (APP / layer / "__init__.py").is_file()


def test_domain_is_pure_python():
    assert violations("domain", ("app.domain",), allowed_third_party=set()) == []


def test_application_depends_only_on_domain():
    assert violations("application", ("app.domain", "app.application"), APPLICATION_THIRD_PARTY) == []


def test_infrastructure_never_imports_the_api():
    found = [
        f"{path.relative_to(APP.parent)} imports {name}"
        for path in modules("infrastructure")
        for name in imports(path)
        if name.startswith("app.api")
    ]
    assert found == []


def test_the_rule_catches_a_violation(tmp_path, monkeypatch):
    """The checker itself works: a domain module importing FastAPI or the api layer is reported."""
    fake_app = tmp_path / "app"
    (fake_app / "domain").mkdir(parents=True)
    (fake_app / "domain" / "bad.py").write_text("import fastapi\nfrom app.api import auth\nfrom . import ok\n")
    monkeypatch.setattr(sys.modules[__name__], "APP", fake_app)

    assert violations("domain", ("app.domain",), allowed_third_party=set()) == [
        "app/domain/bad.py imports third-party fastapi",
        "app/domain/bad.py imports app.api",
    ]
