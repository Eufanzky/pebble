# 8.1 Guilt audit: validation

- [x] The guilt scan has a pattern for every rule in principle 1, each with caught and allowed examples, and passes on `frontend/src`, `frontend/public` and `backend/app` (97 tests).
- [x] Pebble's messages never show a count of zero, for every time of day and personality (`messages.test.ts`); Today's greeting and nudge, with 0, 1 and several tasks (`today.test.ts`).
- [x] Every agent prompt carries the voice rules, and they name principle 1 (`tests/unit/application/test_prompts.py`); `voice.py` catches the principle-1 phrases (`test_voice_rules.py`).
- [x] Evals against Groq (gpt-oss-120b, effort low):
  - Chat (75 calls): JSON 1.00, intent 1.00, distress 1.00, voice 0.93; both misses were WhyBot's long sentences, fixed after.
  - WhyBot, final prompt, three runs: 1.00 on every score. Read by hand: one misread left (A-033).
  - Not done: a chat run with the final prompt, since the day's Groq token cap ran out (A-028 stays open until then).
- [x] Frontend lint, knip, `tsc --noEmit`, `npm test`; backend ruff, vulture, pytest.
