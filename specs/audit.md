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
| A-009 | major | `react-hooks/set-state-in-effect` in `contexts/ToastContext.tsx:21` (`setPhase('visible')` inside the enter effect). It was hidden behind A-005: the React Compiler lint reports only the first error per component. Found during 0.2. | `npm run lint` after fixing A-005 | 0.2 |
| A-010 | minor | `hooks/useReduceMotion.ts` is not imported anywhere. Components read `preferences.reduceAnimations` directly, so the OS `prefers-reduced-motion` setting is ignored. Found during 0.2. | `grep -rn useReduceMotion src` | 3.4 |

## Frontend types

`npx tsc --noEmit`: **passes**. No issues.

## Frontend behaviour

Found by the first unit tests (1.2 onwards), not by the static checks above.

| ID | Sev | Issue | Repro | Fix in |
|:--|:--|:--|:--|:--|
| A-011 | minor | In calm mode, `stripEmoji` (`contexts/PreferencesContext.tsx`) misses emoji outside its hand-listed code-point ranges: for example ⭐ (U+2B50), ⏰ (U+23F0), ⌛ (U+231B), ⬆️ (U+2B06, leaves ⬆) and flags (regional indicators). The app's own sample data is covered, but chat replies from the LLM can contain these. Found during 1.2. | `stripEmoji('⭐ Star')` with calm mode on returns `'⭐ Star'` | 1.7 |

## Backend behaviour

Found by the characterization tests (1.3 onwards), not by the static checks above.

| ID | Sev | Issue | Repro | Fix in |
|:--|:--|:--|:--|:--|
| A-012 | major | `handle_chat` redacts PII only for the intent classifier. The `decompose` and `simplify` routes pass the **raw** chat message to their sub-agents, so emails, phone numbers and similar reach the LLM. Sub-agent output isn't PII-redacted either. Found during 1.3. | `tests/api/test_chat.py::test_sub_agents_never_receive_raw_pii` (strict `xfail`) | 2.4 |
| A-013 | minor | Errors come back as 422 with the internal message as `detail`: malformed LLM JSON (including code-fenced JSON) gives `Expecting value: line 1 column 1 (char 0)`, and unsafe LLM *output* gives the same "Content flagged" 422 as unsafe input, not a safe reply. Found during 1.3. | `tests/api/test_chat.py::test_malformed_classifier_json_is_a_422` | 2.4 |

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

Found by 0.1: **blocker 0 · major 3 · minor 5 · cosmetic 0** (8 issues). Found during 0.2: 1 major, 1 minor (A-009, A-010). Found during 1.2: 1 minor (A-011). Found during 1.3: 1 major, 1 minor (A-012, A-013).

## Status

| ID | Status |
|:--|:--|
| A-001 | Fixed in 0.2: `next` and `eslint-config-next` bumped to 16.3.6. |
| A-002 | **Deferred to 3.3.** npm's only fix is a downgrade of a runtime SDK. 3.3 makes the Azure reader optional behind the built-in reader. The remaining `npm audit` findings (`minimatch`, `decode-uri-component`) all come through this package. |
| A-003 | Fixed in 0.2: `npm audit fix`. |
| A-004 | Fixed in 0.2: `useSyncExternalStore` in `useLocalStorage`, `useReduceMotion` and `useTimeOfDay`; render-time state adjustment in `PageTransition` and `DocumentModal`; `key` remount in `PebbleSpeechBubble`. |
| A-005 | Fixed in 0.2: lazy `useState` in `ComprehensionCheck`, `useRef(0)` in `ToastContext`. |
| A-006 | Fixed in 0.2. |
| A-007 | Fixed in 1.1: dependencies are in `pyproject.toml` and locked in `uv.lock`. |
| A-008 | Open, 2.7. |
| A-009 | Fixed in 0.2: the initial toast phase is derived from `reduceAnimations`. |
| A-010 | Open, 3.4. |
| A-011 | Open, 1.7. |
| A-012 | Open, 2.4. |
| A-013 | Open, 2.4. |

Open: 6 (A-002, A-008, A-010, A-011, A-012, A-013). The frontend's `build`, `lint` and `tsc --noEmit` pass with 0 errors and 0 warnings.
