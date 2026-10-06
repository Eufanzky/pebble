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
| A-014 | major | When the chat request fails, `PebbleChat` shows the raw error to the user: `Chat request failed (500): {"detail":"Internal Server Error"}`, or `Failed to fetch` when the backend is down. It should be a gentle message in Pebble's voice. Found during 1.4. | `components/chat/PebbleChat.test.tsx`, "shows the error in the chat when the backend returns 500" | 1.7 |
| A-015 | minor | Two sample-data lines are close to principle 1 but not caught by the 1.5 guilt scan: task 2's "why" says it's high priority "because it's been in your list since yesterday" (counting time), and task 3's says "without losing momentum" (mild loss framing). Found during 1.5. | `pebble/src/data/sampleTasks.ts` | 6.1 |
| A-016 | major | Calm mode doesn't apply to chat: `PebbleChat` never calls `stripEmoji`, so LLM replies keep their emoji. (Its `calm ? 'x' : 'x'` branches show the same text either way.) Found during 1.7. | Calm mode on, a chat reply with ✨ shows ✨ | 1.7 |
| A-017 | cosmetic | The chat button's mouth uses `transform: 'translateX(-50)'` with no unit, which is invalid CSS, so the mouth isn't centred. Found during 1.7. | `components/chat/PebbleChat.tsx`, the floating button | 3.1 |
| A-018 | major | GitHub Models, the default LLM provider in `tech-stack.md`, was fully retired on 2026-07-30 ([GitHub docs](https://docs.github.com/en/rest/models/inference)). Its endpoint now answers every request with a plain-text `200 OK`, so `LLM_PROVIDER=github` can't work, and the 2.8 eval baseline can't be recorded. Found during 2.8. | `LLM_PROVIDER=github` with any key: every agent returns 503 ("isn't a chat completion (HTTP 200, text/plain, 4 bytes, not JSON)") | 2.8 |
| A-019 | major | The documents feature credits services it doesn't use. A PDF or Word upload says it "will be parsed by Azure Document Intelligence" (removed in 2.7; the backend now has `POST /api/documents/parse`, which the frontend never calls). The built-in reader, which runs only when Immersive Reader is unavailable, says "Powered by Azure AI Immersive Reader", "powered by Azure AI Speech" and "via Azure AI Translator", but it uses the browser's speech synthesis and a word-substitution stand-in for translation. Found during 3.3. | Upload a PDF on /documents; open Reader with no Immersive Reader configured | fix after 3.3 |
| A-020 | major | Settings simulates features and shows made-up results (principle 6, honest claims). "Connected apps" toggles wait 1.5 s and add canned tasks ("Authenticating via Azure API Management OAuth flow", "Powered by BridgeBot agent via Azure API Management"). The voice-input button waits 2.5 s and adds a random canned phrase as a task ("Listening via Azure AI Speech SDK"). The "Pebble has adapted" cards describe adjustments that never happened ("You completed 4 out of 4 small tasks yesterday…"), and "This week" shows fixed numbers (12 tasks, 3h 20m, 4 documents). Found during the A-019 fix and 3.4. | /settings: turn on a connected app, or voice input and press the mic | needs a product decision: remove, or label as a preview until 5.4/5.5 |
| A-021 | minor | The activity page said "In production, this feed maps to Microsoft Foundry Control Plane tracing", which the app doesn't use (principle 6). Found during 3.4. | /activity, the note under the log | 3.4 |
| A-022 | minor | A new user's activity log starts with 16 made-up entries ("Session started. Good morning detected." at 9:01, and so on), stamped at fixed times today. They describe things that never happened (principle 6), and before 9 AM they show times still to come and sort above real entries. Found during 3.7, where they pushed the flow's own entries off the first page in CI (00:29 UTC). | Open /activity before 9 AM with a fresh browser | same decision as A-020 |
| A-023 | minor | Pebble's rotating message "You finished {completedCount} things already. That's really good." also shows with 0 finished ("You finished 0 things already"), which is generic praise for nothing (voice rule: be specific) and reads oddly. Found during 5.4. | `features/companion/data/pebbleMessages.ts`; a new account on Today | 8.1 |
| A-024 | cosmetic | The agents' prompts still call the app "Focusbuddy" ("You are the Task Decomposition Agent for Focusbuddy"), and so does the backend package (`focusbuddy-backend` in `pyproject.toml`). The UI and docs say Pebble. Changing the prompts needs an eval run. Found during 6.3. | `grep -rn Focusbuddy backend/app backend/pyproject.toml` | 7.1 |
| A-025 | minor | `knip@5`, added as a dev dependency in 6.1, pulls in `fast-glob` → `micromatch` → `braces` with high advisories (ReDoS, stack exhaustion). Dev and CI only, never shipped. `knip@6` fixes it. `eslint-config-next` is also flagged through `fast-glob`; npm's only fix is a downgrade to 14, so it waits for an upstream release. Found during 6.3. | `npm audit` | after 6.3 |
| A-026 | cosmetic | `tests/fixtures/documents/make_fixtures.py` says regenerating gives the same file, but `meeting-notes.docx` comes out with new zip entry timestamps (the content is identical), so it shows as changed in git. Found during 6.3. | run the script, then `git status` | when the fixtures next change |
| A-027 | cosmetic | One thing has two names: the UI and the domain say "steps" (`Step`, `TaskStep`), while the API and the frontend types say `subtasks` (`/api/tasks/{id}/subtasks`, `Subtask`, `showSubtasks`). Renaming it changes the API contract and the saved data's JSON, so it wasn't part of 6.4's folder and package renames. Found during 6.4. | `grep -rn subtask backend/app frontend/src` | needs a decision |
| A-028 | minor | The voice eval sits at its 0.9 target: five runs on 2026-10-04 scored 0.83, 0.87, 0.90, 0.90 and 0.90, so it passes or fails by one reply. Nearly every miss is a reply whose sentences average 21–35 words (the rule is 20), in every agent, mostly in the `whyExplanation` and chat replies. The prompts ask for "short, plain sentences" but give no length. Found during 6.6. | `uv run pytest -m eval` a few times | 8.1 (prompt work), or a prompt item of its own |
| A-029 | major | The working agents don't reach the screens that credit them (principle: honest claims). "Break it down" on Today appears only for tasks that already have steps (the examples): it plays a 1.5 s "breaking it down" animation and reveals them, and a task the user typed can't be broken down. Documents never call SimplifyCore: an upload gets the same text at every reading level and no action items. Chat shows the reply text and drops the agents' `data` (steps, tasks). The frontend writes activity entries in agents' names for the user's own actions ("WhyBot: showed explanation", "SimplifyCore: broke down…", "AdaptLens: colour changed"). The README claimed the first two for any task and upload; 6.3's check passed because the tests use the examples. Found while planning 7.4 (WhyBot). | `grep -rn "breakDownTask(\|addEntry(" frontend/src` | 7.1, 7.2, 7.3 |
| A-030 | minor | 6.4's rename of `pebble/` to `frontend/` also rewrote the README's GitHub links (the repository name `pebble` in them became `frontend`), so the CI badge and the release link pointed nowhere. The link check reads only relative links. Found during the Phase 7 plan. | the README's first lines | the Phase 7 plan PR |
| A-031 | minor | CI's builds fetch Google Fonts (`next/font/google`) at build time. When that download fails, the build fails with "Can't resolve '@vercel/turbopack-next/internal/font/google/font'", as the E2E job did on 7.4 and once before; a rerun passed both times. Found during 7.4. | the E2E job's log | self-host the two fonts (`next/font/local`) |
| A-032 | minor | One local E2E run during 7.5 failed "signing out goes back to the sign-in page": after signing out, `/today` still opened instead of redirecting. In the same run the demo flow hung on a toast. The test then passed 10 of 10 times alone and in two full runs, so it couldn't be reproduced. Found during 7.5. | `npx playwright test e2e/sign-in.spec.ts --repeat-each=10` | watch; investigate if it comes back |

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

Found by 0.1: **blocker 0 · major 3 · minor 5 · cosmetic 0** (8 issues). Found during 0.2: 1 major, 1 minor (A-009, A-010). Found during 1.2: 1 minor (A-011). Found during 1.3: 1 major, 1 minor (A-012, A-013). Found during 1.4: 1 major (A-014). Found during 1.5: 1 minor (A-015). Found during 1.7: 1 major, 1 cosmetic (A-016, A-017). Found during 2.8: 1 major (A-018). Found during 3.3: 2 major (A-019, A-020). Found during 3.4: 1 minor (A-021). Found during 3.7: 1 minor (A-022). Found during 5.4: 1 minor (A-023). Found during 6.3: 1 minor, 2 cosmetic (A-024, A-025, A-026). Found during 6.4: 1 cosmetic (A-027). Found during 6.6: 1 minor (A-028). Found while planning Phase 7: 1 major, 1 minor (A-029, A-030). Found during 7.4–7.5: 2 minor (A-031, A-032).

## Status

| ID | Status |
|:--|:--|
| A-001 | Fixed in 0.2: `next` and `eslint-config-next` bumped to 16.3.6. |
| A-002 | **Open.** npm's only fix is a downgrade of a runtime SDK. Since 3.3 the Azure reader is optional and loads only when it's configured; the built-in reader is the default. `minimatch` and `decode-uri-component` still come through this package. |
| A-003 | Fixed in 0.2: `npm audit fix`. |
| A-004 | Fixed in 0.2: `useSyncExternalStore` in `useLocalStorage`, `useReduceMotion` and `useTimeOfDay`; render-time state adjustment in `PageTransition` and `DocumentModal`; `key` remount in `PebbleSpeechBubble`. |
| A-005 | Fixed in 0.2: lazy `useState` in `ComprehensionCheck`, `useRef(0)` in `ToastContext`. |
| A-006 | Fixed in 0.2. |
| A-007 | Fixed in 1.1: dependencies are in `pyproject.toml` and locked in `uv.lock`. |
| A-008 | Fixed in 2.7: Semantic Kernel is removed, and backend tests now fail on any warning. |
| A-009 | Fixed in 0.2: the initial toast phase is derived from `reduceAnimations`. |
| A-010 | Fixed in 3.4: `usePreferences()` exposes `reduceMotion` (the setting, or the OS asking for reduced motion); every component uses it, and it drives the `reduce-animations` class. `useReduceMotion` is removed. Regression tests in `shared/preferences/PreferencesContext.test.tsx`. |
| A-011 | Fixed in 1.7: `stripEmoji` also removes anything with emoji presentation, pictographs followed by U+FE0F, and regional indicators. Regression tests in `PreferencesContext.test.tsx`. |
| A-012 | Fixed in 2.4: every sub-agent gets the redacted message (and redacted task titles), and sub-agent output is PII-redacted. `tests/api/test_chat.py::test_sub_agents_never_receive_raw_pii`, `::test_sub_agent_output_is_pii_redacted`. |
| A-013 | Fixed in 2.4: malformed classifier JSON falls back to a chat reply (code fences are parsed); unsafe or unusable agent output becomes a gentle reply; LLM and safety outages are a 503 with a gentle message and no internals. |
| A-014 | Fixed in 1.7: the chat shows "Pebble couldn't answer just now. Try again whenever you're ready." Regression tests in `PebbleChat.test.tsx`. |
| A-015 | Fixed after phase 3, with A-020: the sample tasks' "why" texts no longer claim things about the user ("your preference is 15-minute chunks", "in your list since yesterday", "you've been working for a while") or use loss framing ("without losing momentum"). They explain the split itself. |
| A-016 | Fixed in 1.7: assistant replies go through `stripEmoji`. Regression tests in `PebbleChat.test.tsx`. |
| A-017 | Fixed after 3.1: the mouth uses `translateX(-50%)`. Regression test in `features/chat/components/ChatLauncher.test.tsx`. |
| A-018 | Fixed in 2.8: the default is now Groq's free tier (`openai/gpt-oss-120b`); the `github` provider is removed; the evals run on Groq with a recorded baseline. |
| A-019 | Fixed after 3.3: PDF and Word uploads are read by `POST /api/documents/parse` (errors show the backend's gentle explanation, or a general message when it's down); the built-in reader credits only itself and the browser's voice, and calls its translation a rough preview. Regression tests in `DocumentsView.test.tsx`, `ImmersiveReader.test.tsx`, `useDocumentUpload.test.tsx`. |
| A-020 | Fixed after phase 3: removed. The connected apps, the voice-input demo, the "Pebble has adapted" cards, the "This week" numbers and the generic "You're doing amazing" bubble are gone, and so is the `voiceInput` preference. The "Adapted for you" badge on two sample tasks (an AdaptLens claim) is gone too. 7.3 (AdaptLens), 7.4/7.5 (calendar) and 8.2 (progress counts) bring the real versions. |
| A-022 | Fixed after phase 3: the activity log starts empty and holds only what agents really did. The E2E flow checks a new user's log has exactly its own 4 entries. |
| A-023 | **Open**, for 8.1 (guilt audit). |
| A-024 | Fixed in 6.4: the prompts and the backend package say Pebble; the evals were run (baseline row of 2026-10-04). |
| A-025 | Fixed after 6.3: knip is on 6 and no longer pulls in `braces` or `micromatch`. The same chain through `eslint-config-next` stays until Next.js updates its ESLint plugin (npm's only fix is a downgrade to 14); it's dev-only. |
| A-026 | **Open**, cosmetic: revert the file after running the script until then. |
| A-028 | **Open**: the prompts need a firmer sentence length; until then the voice eval passes or fails by one reply. |
| A-029 | Fixed in 7.1–7.3: "Break it down" asks CalmSense for any task and a chat breakdown can go on Today (7.1); SimplifyCore simplifies uploads and finds their action items (7.2); only the backend writes the log, and only what an agent did (7.3). |
| A-030 | Fixed in the Phase 7 plan PR. |
| A-031 | **Open**: self-host the fonts so builds don't need Google. |
| A-032 | **Open**: not reproduced; watch the E2E. |
| A-027 | Fixed in 6.6: "steps" everywhere (API routes and fields, frontend types, prompts), and "step size" for "chunk size"; migration 0005 renames saved preferences, and the browser import still reads the old names. |
| A-021 | Fixed in 3.4: the note says what each entry shows (since 4.5 the log is saved to the account). Test in `ActivityView.test.tsx`. |

Open: 6 (A-002, A-023, A-026, A-028, A-031, A-032), each linked to the phase that fixes it or the reason it waits. The frontend's `build`, `lint` and `tsc --noEmit` pass with 0 errors and 0 warnings.
