# 7.4 WhyBot: plan

1. `ActivityEntry.explanation`, the model column and migration 0006, the repository, the API field.
2. `WHYBOT_PROMPT`, `Explain` (screened, cut, falls back), the fake LLM's answer.
3. Each agent's `__call__` and `HandleChat` ask WhyBot and store its answer; a breakdown's or simplification's `why` becomes it; the container wires it in.
4. Tests: WhyBot's unit tests, the pipeline tests over every agent (explained, and the fallback), the store contract, updated API tests.
5. Frontend: the log shows "WhyBot: …"; hard-coded "why" texts go; document tasks carry WhyBot's; the E2E checks WhyBot on the task and in the log.
6. Try it with the real model; docs; PR.
