# 2.8 LLM eval suite: validation

- [x] `uv run pytest` deselects the evals (329 passed, 5 deselected).
- [x] `LLM_PROVIDER=fake uv run pytest -m eval` runs all 30 cases (40 calls) and fails intent and distress, because the keyword fake misses indirect distress. The evals discriminate.
- [x] With no LLM key, the evals skip with a clear message.
- [x] The voice checker's unit tests pass (calm replies pass; banned phrases and long sentences are caught).
- [x] The `LLM evals` workflow runs against Groq and meets every target (JSON 1.00, intent 0.97, distress 1.00, voice 0.93); the baseline is in `tests/evals/README.md`. (GitHub Models, the original provider, turned out to be retired: A-018.)
