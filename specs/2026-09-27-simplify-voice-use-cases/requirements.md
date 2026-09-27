# 2.5 SimplifyCore and PebbleVoice as use cases: requirements

Roadmap item: **2.5** (Phase 2). Branch: `refactor/2.5-simplify-voice-use-cases`.

## Goal

Move the last two agents into `application/` with the 2.4 pattern, and delete the legacy `app/agents/` package.

## Scope

In scope:
- Domain:
  - `Simplification`, `ExtractedTask` (`domain/documents.py`)
  - `Encouragement` (`domain/chat.py`)
  - `TaskTag` with `parse` (`domain/tasks.py`)
- Application: `SimplifyDocument` (`simplifycore.py`) and `Encourage` (`pebblevoice.py`), with typed `HandleChat` protocols.
- API:
  - thin `/simplify` and `/motivate` endpoints
  - `api/presenters.py` for the JSON mapping
  - the Cosmos documents router and the focus router call the use cases (both routers go in 2.7)
- Removed: `app/agents/` (legacy SimplifyCore, PebbleVoice and the 2.4 adapters) and `services/openai_client.py`.
- Tests: use-case tests for both agents and API tests for both endpoints.

## Decisions

1. **Same shape as CalmSense.**
   - `run()` takes already-screened input; `__call__` screens first and serves the direct endpoints.
   - The reply is parsed strictly (`AgentReplyError`).
   - All texts are checked in one Content Safety call, then every field is redacted.
2. **SimplifyCore checks groundedness** against the (redacted) source text it was given. The result stays in the response, as before.
3. **Unknown task tags become `project`.** The UI can only show four tags; the old documents router already did this, and now the domain does it everywhere.
4. **PebbleVoice redacts task titles itself**, since they're user text on their way to the LLM. `HandleChat` no longer has to remember to.
5. **`/simplify` now returns `groundedness`** in its response model. It used to be computed and then dropped by the schema.
