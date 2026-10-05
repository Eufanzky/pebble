# 7.4 WhyBot: validation

- [x] The pipeline test asserts every agent result (chat to each agent, distress, chat, and the three direct endpoints) has WhyBot's explanation, and that the agent's reasoning explains it when WhyBot is down.
- [x] WhyBot's unit tests: the request it builds; that its answer is screened, redacted and cut; the fallback for an outage, a rate limit, bad JSON, an empty answer and a flagged answer.
- [x] The explanation survives Postgres and the fake alike (store contract); migration 0006 passes the upgrade, downgrade and `alembic check` tests.
- [x] No hard-coded "why" text remains in the frontend (the examples, document tasks and "start fresh"); a test checks that the examples have none.
- [x] Backend: 644 tests with Postgres, coverage 99.6%. Frontend: 583 tests. E2E 27/27: the demo flow sees WhyBot's explanation on the broken-down task and in the log.
- [x] With the real model (Groq, gpt-oss-120b), four sample results were explained well, with no voice-rule problems, after raising the token limit from 256 to 512:
  - CalmSense: "Because you set a small step size, CalmSense broke the essay into tiny tasks. In the evening, small steps help keep focus."
  - SimplifyCore: "You set reading level 3, so SimplifyCore rewrote the sentence in simpler words. It kept the main idea while using easier language."
  - PebbleVoice (distress): "…Since you have 0 tasks today, it didn't add a new task automatically." This one is slightly off: it was 0 of 4 done. That's for WhyBot's evals (7.9).
