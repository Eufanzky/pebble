# 2.4 Orchestrator and CalmSense as use cases: requirements

Roadmap item: **2.4** (Phase 2). Branch: `refactor/2.4-orchestrator-use-case`.

## Goal

Move the orchestrator and CalmSense into `application/` as use cases that depend only on the LLM and safety ports. Every chat turn runs one pipeline, and the router is thin. Fix A-012 and A-013 while the code moves.

## Scope

In scope:
- Domain: `Intent`, `Mood` and `AgentName` (`domain/agents.py`), `ChatContext` and `ChatReply` (`domain/chat.py`), `Step` and `TaskBreakdown` (`domain/tasks.py`).
- Application:
  - `HandleChat` (`application/agents/orchestrator.py`)
  - `DecomposeTask` (`application/agents/calmsense.py`)
  - `parse_json_object`
  - `SafetyGate.ensure_output_safe`
  - `AgentReplyError`
  - prompts moved to `application/prompts.py`
- API:
  - `api/dependencies.py` (a container of adapters, with `set_container` for tests)
  - `api/errors.py` (error → HTTP mapping)
  - a thin `/chat` and `/decompose`
- Tests:
  - the 1.3 tests ported to the new fakes
  - pipeline and CalmSense use-case tests
  - `/decompose` API tests
- Removed:
  - the legacy orchestrator, `task_decomposition.py`
  - the Semantic Kernel kernel and plugins (unused once the orchestrator moved; the dependency itself goes in 2.7)
  - the `pii_detector` shim
  - the SDK-level test fakes

Out of scope:
- SimplifyCore and PebbleVoice as use cases (2.5). Until then they run the legacy code behind `agents/legacy.py`, and the legacy LLM and safety helpers delegate to the ports so that one set of fakes covers everything.
- WhyBot and the activity log in the pipeline (5.1, 4.2).

## Decisions

1. **One pipeline per turn:** input safety → redaction → classifier → output safety → the routed agent, which checks and redacts its own output. Sub-agents get only the redacted message (A-012).
2. **Unsafe or unusable output becomes a reply, not an error (A-013).**
   - Flagged output: `SAFE_REPLY`.
   - Unparseable classifier JSON: `UNCLEAR_REPLY`.
   - An unusable sub-agent reply: `AGENT_FAILED[intent]`.
   - In all three cases `data` is `null`.
   Unsafe *input* is still a 422 with the same message as before.
3. **Outages are a gentle 503.** LLM errors, Content Safety outages (analysis fails closed) and unusable replies on direct endpoints never expose internals. A provider 429 says "Pebble is resting" and passes `Retry-After` on.
4. **Structured output is checked once.** CalmSense sends all its texts to Content Safety in one call (rate limits), then redacts each field locally.
5. **Moods are normalised** to the four the character can show.
6. **Tests always run with fakes.** The autouse `container` fixture guarantees no test uses a developer's `.env` provider.
