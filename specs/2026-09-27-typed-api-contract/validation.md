# 3.5 Typed API contract: validation

- [x] Renaming `agent_name`'s alias in `ChatResponse` and running `npm run api:generate` makes `tsc --noEmit` fail in the chat code and tests.
- [x] `npm test` (357 passed), lint, `tsc --noEmit` pass; the regenerated files match the committed ones.
- [x] A camelCase chat request to the real backend (`LLM_PROVIDER=fake`) is read correctly ("You finished 2 things today").
- [x] The CI `API contract` job is green on this PR.
