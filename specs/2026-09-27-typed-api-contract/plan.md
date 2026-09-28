# 3.5 Typed API contract: plan

1. Add the export script and the npm scripts; generate `openapi.json` and `schema.d.ts`.
2. Replace the hand-written API types with `ApiSchema`; switch the chat request to camelCase; type the MSW handlers.
3. Add the CI drift job.
4. Prove it: rename `agentName` in the backend, regenerate, and see `tsc` fail; revert.
5. Check a camelCase chat request against the real backend; update the docs; tick 3.5.
