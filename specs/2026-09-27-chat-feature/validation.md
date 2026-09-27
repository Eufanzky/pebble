# 3.1 Skeleton and chat: validation

- [x] The 1.4 chat tests pass unchanged (only the file moved).
- [x] `npm test` (116 passed), `npm run lint`, `tsc --noEmit` and `npm run build` pass.
- [x] New tests: `postJson` (success, error status, unreachable), `lib/chat.ts`, and `useChat` (reply, blank message, mood flash, error).
- [x] Each boundary rule reports an error on a throwaway file (deep feature import, `../../` out of a feature, `shared/` importing a feature).
- [x] With `LLM_PROVIDER=fake` and `DEV_MODE=true`, `POST /api/agents/chat` through `next start` returns a CalmSense reply.
- [x] No component file in `features/chat` is over 200 lines.
