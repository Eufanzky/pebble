# 2.3 Safety port: validation

- [x] Contract tests map scores of 0, 2, 4 and 6 in every category onto the verdict, plus null severities, unknown categories, chunked long text, and fail-closed analysis errors.
- [x] Unit tests: a prompt attack is rejected before content analysis; unsafe input is rejected in every category; severity 1 passes; the raw text is checked before redaction; unsafe output raises `UnsafeOutputError`.
- [x] The 1.3 tests pass unchanged, including the PII tests that go through the shim.
- [x] `uv run pytest` and `ruff check` pass, and the architecture test passes.
