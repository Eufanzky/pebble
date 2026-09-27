# 2.8 LLM eval suite: validation

- [x] `uv run pytest` deselects the evals (329 passed, 5 deselected).
- [x] `LLM_PROVIDER=fake uv run pytest -m eval` runs all 30 cases (40 calls) and fails intent and distress, because the keyword fake misses indirect distress. The evals discriminate.
- [x] With no LLM key, the evals skip with a clear message.
- [x] The voice checker's unit tests pass (calm replies pass; banned phrases and long sentences are caught).
- [ ] The `LLM evals` workflow runs on `main`, and its scores are recorded in `tests/evals/README.md` (follow-up PR).
