# 2.2 LLM port: plan

1. Write the port and its errors.
2. Write the OpenAI-compatible adapter and its contract tests.
3. Write `FakeLLM` with scripting and default replies, and its unit tests.
4. Add the settings and the factory, with tests.
5. Widen the guilt scan to `backend/app`; update `.env.example`, `backend/README.md` and `CLAUDE.md`; tick 2.2.
