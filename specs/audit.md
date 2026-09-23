# Audit

Roadmap item 0.1. This file lists what the static checks report on the code as it was on `main` at `12d099d`.
Scope, severity scale and layout are in `2026-09-23-audit/requirements.md`. The manual walkthrough of every page was deferred and is not covered here.

## Environment

| | |
|:--|:--|
| Date | 2026-09-23 |
| OS | Linux 6.18 (WSL2), x86_64 |
| Node / npm | v22.22.1 / 9.2.0 |
| Python | 3.12.13 (fresh conda env, no `.env` file, empty environment) |

The frontend was checked in a clean copy of `pebble/` (no `node_modules`, no `.next`).

## Severity

- `blocker`: install, build or import fails, or the app can't start.
- `major`: a check reports an error that doesn't stop the build, or a problem that will break a flow.
- `minor`: warnings: deprecations, unused code, lint warnings.
- `cosmetic`: formatting or naming only.

## Frontend install

`npm install`: succeeds (379 packages) with no install warnings. `npm audit` reports 14 vulnerabilities (1 critical, 9 high, 3 moderate, 1 low).

| ID | Sev | Issue | Repro | Fix in |
|:--|:--|:--|:--|:--|
| A-001 | major | `next@16.2.1` (direct) has a critical advisory: Server Components DoS and a middleware/proxy bypass. It also pulls in vulnerable `postcss` and `sharp`. Fixed in `next@16.3.6`. | `npm audit` | 0.2 |
| A-002 | minor | `@microsoft/immersive-reader-sdk@^1.4.0` (direct) is flagged high through `minimatch` (ReDoS) and `decode-uri-component` (DoS). npm's only fix is a downgrade to 1.2.0. | `npm audit` | 0.2 |
| A-003 | minor | 9 transitive packages have advisories that `npm audit fix` resolves without breaking changes: `brace-expansion`, `browserslist`, `js-yaml`, `nanoid`, `picomatch` (high); `@humanfs/node`, `baseline-browser-mapping`, `decode-uri-component` (moderate); `@babel/core` (low). | `npm audit` | 0.2 |

## Frontend build

`npm run build`: **passes**. It compiles, type-checks and prerenders all 8 routes. No issues.

## Frontend lint

`npm run lint`: **fails** (exit 1) with 10 problems: 8 errors and 2 warnings.

| ID | Sev | Issue | Repro | Fix in |
|:--|:--|:--|:--|:--|
| A-004 | major | `react-hooks/set-state-in-effect` (6 errors): `setState` is called synchronously inside `useEffect`. Files: `components/documents/DocumentModal.tsx:49`, `components/layout/AppShell.tsx:23`, `components/pebble/PebbleSpeechBubble.tsx:19`, `hooks/useLocalStorage.ts:13`, `hooks/useReduceMotion.ts:12`, `hooks/useTimeOfDay.ts:17`. | `npm run lint` | 0.2 |
| A-005 | major | `react-hooks/purity` (2 errors): an impure function is called during render. Files: `components/documents/ComprehensionCheck.tsx:36` (`Math.random` in `useMemo`), `contexts/ToastContext.tsx:18` (`Date.now` in `useRef`). | `npm run lint` | 0.2 |
| A-006 | minor | `@typescript-eslint/no-unused-vars` (2 warnings): `showToast` in `app/focus/page.tsx:75` and `words` in `components/documents/ImmersiveReader.tsx:294`. | `npm run lint` | 0.2 |

## Frontend types

`npx tsc --noEmit`: **passes**. No issues.

## Backend install

`pip install -r requirements.txt` on Python 3.12: **succeeds**, and `pip check` finds no broken requirements.

| ID | Sev | Issue | Repro | Fix in |
|:--|:--|:--|:--|:--|
| A-007 | minor | `requirements.txt` has only lower bounds (`>=`) and there is no lockfile, so every install can resolve different versions. This install got, for example, `openai 3.19.1` against `>=1.40.0` and `fastapi 0.141.1` against `>=0.115.0`. | `pip install -r requirements.txt` | 1.1 |

## Backend imports

`python -m compileall app`: **passes**. Each of the 36 modules under `app/` was imported on its own with no `.env` file. They all import (exit 0), and `app.main` imports cleanly.

| ID | Sev | Issue | Repro | Fix in |
|:--|:--|:--|:--|:--|
| A-008 | minor | Importing `app.services.kernel` (and so `app.main`, `app.agents.orchestrator` and `app.routers.agents`) triggers a `PydanticDeprecatedSince211` warning, "`__get_pydantic_core_schema__` … removed in V3.0". It comes from `semantic_kernel.connectors.ai.open_ai`, not from project code. | `python -W default -c "import app.services.kernel"` | 2.7 |

## Summary

**blocker 0 · major 3 · minor 5 · cosmetic 0** (8 issues)

- The frontend builds and type-checks. `npm run lint` is the only failing gate (A-004, A-005), and a Next.js security bump is due (A-001). All of these belong to 0.2.
- The backend installs and every module imports with no configuration. Its two warnings are removed by 1.1 (`uv` lockfile) and 2.7 (Semantic Kernel removal).
