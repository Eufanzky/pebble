# 7.9 Evals for new agents: validation

- [x] The harness runs offline (`LLM_PROVIDER=fake`).
- [x] Against Groq (gpt-oss-120b), both sets, 9 tests passed in about 9 minutes:
  - Chat (74 calls): JSON 1.00, intent 1.00, distress 1.00, voice 0.97.
  - WhyBot (10 calls): answered 1.00, voice 1.00, names the setting 1.00, no invented numbers 1.00.
- [x] Read by hand: 7 of 10 explanations are right and plain. 3 misread progress, logged as A-033.
- [x] Scores recorded in `backend/tests/evals/README.md`.
- [x] ruff, vulture.
