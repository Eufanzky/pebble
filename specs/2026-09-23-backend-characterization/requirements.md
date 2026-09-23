# 1.3 Backend characterization tests: requirements

Roadmap item: **1.3 Backend characterization tests** (Phase 1). Branch: `test/1.3-backend-characterization`.

## Goal

Pin how `POST /api/agents/chat` behaves today, so phase 2 can move the orchestrator and the safety services into clean-architecture layers without changing what callers see.

## Scope

In scope:
- Fakes for the LLM (Semantic Kernel and the direct OpenAI client) and for Content Safety (text analysis, Prompt Shields, Groundedness Detection), exposed as fixtures in `tests/conftest.py`.
- API tests through `/api/agents/chat` for:
  - intent routing: each intent to its agent, distress without a sub-agent, and the chat fallback for unknown or missing intents
  - the Semantic Kernel first, direct OpenAI second classifier fallback
  - the severity ≥ 2 rejection, for every category, on input and output
  - Prompt Shields: the attack rejection, its place before Content Safety, and its non-blocking errors
  - PII redaction of the classifier's input and output
  - the `{intent, response, mood, agentName, data}` response shape
  - today's error mapping: malformed JSON, LLM failure, invalid requests
- Unit tests for `detect_pii` / `redact_pii`.
- Logging what the tests uncovered in `specs/audit.md`.

Out of scope:
- Changing any code under `app/`. The item is done when the tests pass on the current, untouched code.
- The direct `/decompose`, `/simplify` and `/motivate` endpoints, which the frontend doesn't use (2.5 covers them as use cases).
- Auth tests (4.3 replaces Entra), and CI (1.6).

## Decisions

1. **Test through HTTP.** Most tests call `/api/agents/chat`, not `handle_chat`, so they don't depend on where the orchestrator lives. 2.4 ports them onto the fake `LLMProvider` and `SafetyChecker` ports.
2. **The LLM is faked at the Python seam.** The `openai` SDK (3.x) sends requests through its own vendored `httpx2`, which respx can't intercept. `FakeLLM` replaces `get_openai_client()` and the orchestrator's `get_kernel()`. It picks each reply by the agent's system prompt and records every call, so a test can check what the LLM saw.
3. **Content Safety text analysis is faked at `_get_client()`**, because its Azure SDK client uses aiohttp. The real `check_text_safety` still runs, so the severity threshold itself is under test. Prompt Shields and Groundedness Detection use plain `httpx` and are faked with respx.
4. **Bugs are pinned, not fixed.** Two findings are logged as A-012 and A-013 for 2.4:
   - A-012: sub-agents get the raw, unredacted message. The correct behaviour is written as a **strict `xfail`** test, so it passes today and fails as soon as 2.4 fixes it, which prompts removing the marker.
   - A-013: internal errors (malformed LLM JSON, unsafe LLM output) come back as 422 with internal messages. This is pinned as it is.
5. **Settings are patched per test**, never read from a developer's `.env`: the fixtures set the Content Safety endpoint and key, and the auth dependency is overridden.
