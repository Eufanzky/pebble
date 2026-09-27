# 2.2 LLM port: requirements

Roadmap item: **2.2 LLM port** (Phase 2). Branch: `feat/2.2-llm-port`.

## Goal

Put the LLM behind an interface, with a free default provider and an offline fake, so the agents can move onto it in 2.4 and 2.5.

## Scope

In scope:
- `app/application/ports/llm.py`: `LLMRequest`, the `LLMProvider` protocol, and the errors `LLMUnavailableError`, `LLMTimeoutError`, `LLMRateLimitedError` (with `retry_after`) and `LLMResponseError`.
- `app/infrastructure/llm/openai_compatible.py`: one adapter with constructors for GitHub Models (the default), OpenAI and Azure OpenAI.
- `app/infrastructure/llm/fake.py`: `FakeLLM`, scripted per agent, with deterministic default replies for every agent.
- `app/infrastructure/llm/factory.py`: `build_llm_provider(settings)`, which picks the adapter from `LLM_PROVIDER`. With missing credentials it returns `UnconfiguredLLM`.
- Settings: `LLM_PROVIDER`, `LLM_API_KEY`, `LLM_MODEL`, `LLM_BASE_URL` and `LLM_TIMEOUT_SECONDS`.
- Contract tests (respx) for success, malformed responses, 429, timeouts and HTTP errors, plus unit tests for the fake and the factory.

Out of scope:
- Moving the agents onto the port (2.4, 2.5). The app doesn't use the port yet, and the 1.3 tests still fake the legacy clients.

## Decisions

1. **Plain `httpx`, not the `openai` SDK.** One small request covers all three providers. The SDK's vendored `httpx2` can't be intercepted by respx, which the contract tests need.
2. **The adapter returns text; use cases parse it.** Malformed JSON in the *content* is the use case's concern (2.4). A malformed *response* (not a chat completion) is an `LLMResponseError`.
3. **JSON mode by default.** `response_format: json_object` is sent unless a request opts out. Every agent prompt asks for JSON.
4. **`LLMRequest.agent`** names the caller. The real adapters use it only in error messages and logs; the fake picks its reply by it.
5. **No retries.** A 429 raises `LLMRateLimitedError` with `retry_after`, so 8.4 can show "Pebble is resting" instead of spending more of the quota.
6. **The fake's default replies are user-visible in E2E**, so the guilt scan now covers the whole `backend/app` tree, not only `agents/`.
