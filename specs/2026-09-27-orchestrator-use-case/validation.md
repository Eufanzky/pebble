# 2.4 Orchestrator and CalmSense as use cases: validation

- [x] `uv run pytest` (235 passed) and `ruff check` pass; the architecture test passes.
- [x] The ported 1.3 tests pass. Tests whose expectations changed on purpose name A-012 or A-013.
- [x] Each hand-made break fails at least one test:
  - [x] sub-agents get the raw message
  - [x] the classifier output isn't safety-checked
  - [x] CalmSense output isn't safety-checked
  - [x] distress routes to CalmSense
  - [x] task titles aren't redacted
  - [x] the input isn't redacted
  - [x] Content Safety runs before Prompt Shields
- [x] `LLM_PROVIDER=fake DEV_MODE=true uvicorn app.main:app` answers chat for decompose (with PII redacted), distress, chat and motivate, and `/decompose`.
- [x] The guilt scan covers the new prompt and orchestrator paths.
