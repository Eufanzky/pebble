# 2.1 Layer skeleton: requirements

Roadmap item: **2.1 Layer skeleton** (Phase 2). Branch: `refactor/2.1-layer-skeleton`.

## Goal

Create the four clean-architecture layers from `tech-stack.md`, move the code that already belongs to a layer, and make the dependency rule a test.

## Scope

In scope:
- `app/domain/`, `app/application/`, `app/infrastructure/` and `app/api/`, each with a docstring stating its rule.
- Moves, with no behaviour change:
  - `app/config.py` → `app/infrastructure/config.py`
  - `app/routers/` → `app/api/routers/`
  - `app/models/*` → `app/api/schemas/` (`agents`, `documents`, `focus`, `records`)
  - `app/services/auth.py` → `app/api/auth.py`
- `tests/unit/test_architecture.py`: parses every module's imports and checks the rule.
- The dependency rule in `backend/README.md`, and the updated structure in both READMEs and `CLAUDE.md`.

Out of scope:
- Ports, adapters and use cases (2.2 to 2.6). `app/agents/` and `app/services/` stay as legacy packages until they're moved or removed.

## Decisions

1. **The rule:** `domain` imports only the standard library; `application` imports only `domain`; `infrastructure` never imports `api`; `api` may import any layer because it holds the wiring; `main.py` is the composition root.
2. **Settings live in `infrastructure/`.** They read the environment, which is an outside concern. The api layer reads them only for wiring (CORS, auth).
3. **The checker checks itself.** One test plants a bad domain module in a temporary tree and expects both violations to be reported.
4. **Legacy packages aren't checked.** 2.7 deletes what's left of them.
