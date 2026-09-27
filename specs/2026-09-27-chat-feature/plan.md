# 3.1 Skeleton and chat: plan

1. Add `shared/lib/api.ts` with tests.
2. Move `PebbleChat` and its test into `features/chat`; pull the logic into `lib/chat.ts` and `hooks/useChat.ts`; split the component.
3. Add the public `index.ts`; point `AppShell` and the MSW handlers at it; delete `lib/api.ts`.
4. Add the ESLint boundary rules and prove each one fires on a throwaway file.
5. Run lint, typecheck, tests and the build; send a chat through the Next.js proxy to the backend with the fake LLM.
6. Update `CLAUDE.md`; tick 3.1.
