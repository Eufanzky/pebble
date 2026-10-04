# 6.5 Names in the code: requirements

Roadmap item: **6.5** (Phase 6), from a review of every name in the project ("make sure every naming is made to understand easily"). Branch: `refactor/6.5-names-in-code`.

## Goal

A reader can tell what a file, module, class, test or CSS class holds from its name, and each agent has one name.

## Changes

### An agent has one name

CalmSense was also "the Task Decomposition Agent" (its prompt), `TASK_DECOMPOSITION_PROMPT`, and `"decompose"` (what the fake LLM and the tests called it); likewise SimplifyCore and PebbleVoice.

- The prompts are `CALMSENSE_PROMPT`, `SIMPLIFYCORE_PROMPT` and `PEBBLEVOICE_PROMPT`, and each opens "You are CalmSense, the agent that breaks tasks into steps for Pebble…".
- `LLMRequest.agent` is `orchestrator` or the agent's name (`CalmSense`, …), so tests script `llm.script("CalmSense", …)`. Intents (`decompose`, `simplify`, `motivate`) stay what the orchestrator classifies and what the routes are called; the use cases keep their verb names (`DecomposeTask`, `SimplifyDocument`, `Encourage`), which say what they do.

### Backend files where their layer is

| Was | Now |
|:--|:--|
| `app/infrastructure/immersive_reader.py` (the only loose adapter) | `app/infrastructure/reader/azure_immersive_reader.py` |
| `app/infrastructure/parsing/local_parser.py` | `parsing/local_document_parser.py` (its class and test say so) |
| `tests/unit/test_safety_gate.py`, `test_voice_rules.py` | `tests/unit/application/` |
| `tests/unit/test_fake_llm.py`, `test_llm_factory.py`, `tests/contract/test_sql_repository_outage.py` | `tests/unit/infrastructure/` (contract is for outside services) |
| `tests/unit/application/test_handle_chat.py` | `test_orchestrator.py`, like `test_calmsense.py` and the rest |
| `tests/api/test_simplify_and_motivate.py` | `test_simplify.py`, `test_motivate.py` |
| `tests/integration/test_preferences_and_activity_repositories.py` | `test_preferences_repository.py`, `test_activity_repository.py` |
| the reader tests inside `tests/api/test_app.py` | `tests/api/test_immersive_reader_token.py` |

### Frontend

| Was | Now | Why |
|:--|:--|:--|
| `activity/lib/stats.ts` | `activity/lib/summary.ts` | It holds `activitySummary`; "stats" is another feature. |
| `chat/lib/chat.ts` | `chat/lib/messages.ts` | "chat" inside `chat/` said nothing. |
| `MiniPebble` (documents) and `MiniPebbleFace` (inside `WhyCard`) | one `PebbleFace` in `companion` | Two names, two drawings, for the same face. |
| `interpolateMessage` in `companion/data/` | `companion/lib/messages.ts` | `data/` holds data; logic lives in `lib/`. |
| CSS `pb-…` | `pebble-…` | Spell it out. |
| `PebbleMoods.css` | `PebbleSpeechBubble.css` | Only its speech-bubble rules were used; the rest styled classes nothing renders. Renaming `pb-` would have woken those rules (`.mood-sleepy .pebble-eye`), so they're deleted. |
| `glass-card` | `ui-card` | Nothing is glass; it was already the `Card` surface. |
| `e2e/demo-flow.spec.ts` (ten tests) | `demo-flow`, `tasks`, `stats`, `account`, `installable`, `sign-in`, `layout` specs, with `helpers.ts` | One file per area; it also runs in parallel. CI's job is "E2E". |

## Kept

- `backend/app/` (FastAPI's convention), `importing.py` (`import` is a keyword), the route group `_shell` (Next.js's private-folder convention).
- `subtasks` and "chunk size": 6.6.
