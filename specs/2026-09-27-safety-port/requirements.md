# 2.3 Safety port: requirements

Roadmap item: **2.3 Safety port** (Phase 2). Branch: `feat/2.3-safety-port`.

## Goal

Put Content Safety and PII redaction behind ports, with a no-op adapter for when Azure isn't configured, and one gate that decides what reaches the LLM and the user.

## Scope

In scope:
- `domain/safety.py`: `HarmCategory`, `SEVERITY_THRESHOLD = 2`, `SafetyVerdict`, `Groundedness`, `Redaction`.
- `application/ports/safety.py`: `SafetyChecker` (analyze, prompt attack, groundedness), `PIIRedactor`, and `SafetyCheckError`.
- `application/safety.py`: `SafetyGate.screen_input` (Prompt Shields → Content Safety → redaction) and `screen_output` (Content Safety → redaction).
- `application/errors.py`: `PromptAttackError` and `UnsafeContentError` (with today's messages), and `UnsafeOutputError`.
- Adapters: `AzureContentSafety` (REST), `NoOpSafetyChecker`, `RegexPIIRedactor` (moved from `services/pii_detector.py`), and a factory.
- Contract tests for the severity mapping; unit tests for the reject path.

Out of scope:
- Switching the orchestrator to the gate (2.4). The legacy `services/content_safety.py` stays until then, and `services/pii_detector.py` becomes a shim over the new redactor.

## Decisions

1. **REST for text analysis too.** The Azure SDK client uses aiohttp, which respx can't see. Three plain `httpx` calls keep the adapter testable, and 2.7 can drop `azure-ai-contentsafety`.
2. **Text analysis fails closed.** If the check can't run, it raises `SafetyCheckError` rather than calling the content safe. Prompt Shields and Groundedness fail open with a warning, as before.
3. **Long text is checked in 10,000-character chunks** (the API limit), and the worst chunk decides. Before this, text over the limit made the SDK call fail.
4. **Unsafe output is its own error** (`UnsafeOutputError`, no user message), so 2.4 can swap in a safe reply instead of showing an error (A-013).
5. **The threshold rule lives in the domain,** so it's tested once without HTTP, and the adapter tests only check that the API's scores map onto it.
