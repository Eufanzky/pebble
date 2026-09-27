# 2.5 SimplifyCore and PebbleVoice as use cases: validation

- [x] `uv run pytest` (266 passed), `ruff check` and the architecture test pass.
- [x] Use-case tests cover each prompt, strict parsing, the single output check, redaction of every field, groundedness, tag and mood normalisation, and title redaction.
- [x] API tests cover success, unsafe input and output, validation, and a 503 when the LLM is down.
- [x] `app/agents/` is gone, and nothing imports it.
- [x] With `LLM_PROVIDER=fake`, the server answers a simplify chat and `/motivate`.
