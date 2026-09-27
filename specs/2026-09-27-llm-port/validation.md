# 2.2 LLM port: validation

- [x] Contract tests cover success (request shape, auth header), Azure's URL and `api-key`, malformed responses, 429 with and without `retry-after`, timeouts, connection errors and HTTP errors.
- [x] `LLM_PROVIDER=fake` builds `FakeLLM`; a missing key gives an LLM that raises `LLMUnavailableError`; an unknown provider fails at startup.
- [x] `uv run pytest` passes (the 1.3 tests are unchanged), and `ruff check` passes.
- [x] The architecture test passes: the port imports only the standard library.
- [x] The guilt scan passes over `backend/app`.
