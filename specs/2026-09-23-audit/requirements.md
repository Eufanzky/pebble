# 0.1 Audit: requirements

Roadmap item: **0.1 Audit** (Phase 0: Baseline). Branch: `docs/0.1-audit`.

## Goal

Get a complete, tagged list of what fails today when the frontend and backend are installed and statically checked. That list is the input for 0.2 (green build) and 1.7 (runtime bugs).

## Context

- The code is at the `v0.1.0-hackathon` state plus the docs PR (#5). Nothing has been checked since the hackathon.
- Neither part has a test suite yet (see `testing.md` and roadmap phase 1). The only checks available are the build, the linter, the type checker and Python imports.
- The backend depends on many Azure SDKs (`requirements.txt`) that phase 2.7 will remove. Import failures in those modules are still recorded, because 0.2 and 1.x need a backend that starts.
- See `mission.md` for the product principles and `tech-stack.md` for the target stack. This item changes neither.

## Scope

In scope: **static checks only**.

- Frontend (`pebble/`):
  - `npm install` (record install warnings, peer-dependency and audit notices)
  - `npm run build`
  - `npm run lint`
  - `npx tsc --noEmit`
- Backend (`backend/`):
  - `pip install -r requirements.txt` in a clean Python 3.12 environment
  - an import check of every module under `app/` (`python -c "import app.main"` plus an import of each module on its own, so one failure doesn't hide the rest)
  - `python -m compileall app` for syntax errors

Out of scope:

- The manual walkthrough of every page. The roadmap text for 0.1 mentions it, but it is **deferred**; runtime and flow bugs are found in 1.4 (frontend characterization tests) and fixed in 1.7.
- Running the backend (uvicorn, `DEV_MODE`, Swagger calls).
- A principle-drift review (guilt patterns, fake presence, name-only agents). That is 6.1 and 7.1.
- Fixing anything. This PR only adds documentation. Fixes belong to 0.2 and later.

## Decisions

1. **Output file:** `specs/audit.md`, as the roadmap and `CLAUDE.md` already reference it.
2. **Severity scale:**
   - `blocker`: install, build or import fails, or the app can't start.
   - `major`: a check reports an error that doesn't stop the build (for example a lint error), or a problem that will break a flow.
   - `minor`: warnings: deprecations, unused code, lint warnings.
   - `cosmetic`: formatting or naming only.
3. **Layout:** one section per area (Frontend install, Frontend build, Frontend lint, Frontend types, Backend install, Backend imports), each with one table:

   | ID | Sev | Issue | Repro | Fix in |
   |:--|:--|:--|:--|:--|

   - IDs are `A-001`, `A-002`, and so on, numbered in the order the issues are found. They stay stable once assigned.
   - **Fix in** names the roadmap item that will fix the issue: `0.2` for build, lint and type errors, `1.7` for runtime issues, or a later item when the code is due to be deleted or rewritten (for example `2.7` for dead Azure services).
   - The file ends with a summary count by severity.
4. **Grouping repeated errors:** when a lint rule fires many times, record one row per rule with the count and the affected files, not one row per line.
5. **Environment is recorded:** the Node, npm and Python versions, the OS and the date go at the top of `audit.md`.

## Open questions

- Should the 0.1 roadmap text be changed to drop "walk through every page by hand", or should the walkthrough move to its own item? For now this spec only records the deferral here.
