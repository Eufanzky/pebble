# 3.1 Skeleton and chat: requirements

Roadmap item: **3.1** (Phase 3). Branch: `refactor/3.1-chat-feature`.

## Goal

Start the feature layout from `tech-stack.md`: create `src/features/` and `src/shared/`, and move the chat and the API client there without changing what the user sees.

## Scope

In scope:
- `src/shared/lib/api.ts`: `postJson` and `ApiError` (the status, or `null` when the backend is unreachable, plus the detail).
- `src/features/chat/`:
  - `api/sendChatMessage.ts`
  - `lib/chat.ts`: the request body, the messages, the mood and the activity entry, as pure functions
  - `hooks/useChat.ts`: the conversation state and the send flow
  - `components/`: `PebbleChat` split into the launcher, panel, message, input and thinking pieces
  - `types.ts` and the public `index.ts`
- `src/lib/api.ts` is removed; `AppShell` and the MSW handlers use `@/features/chat`.
- ESLint enforces the import boundaries, and `CLAUDE.md` documents them.

Out of scope:
- Moving the contexts, `lib/types.ts` and the other old folders (3.2 to 3.4).
- Generated API types (3.5).

## Decisions

1. **Boundaries are a lint rule, not only a note.** `no-restricted-imports`:
   - outside a feature, `@/features/<name>/...` is an error; only `@/features/<name>` is allowed
   - inside a feature, `../../*` is an error, so a feature can't reach into a sibling with a relative path
   - `src/shared/` can't import `@/features` at all
2. **Logic moves out of JSX.** The request body, reply mapping, mood check and activity entry are pure functions in `lib/chat.ts`, with unit tests.
3. **Only known moods flash.** The backend already normalises moods, so this changes nothing in practice, but the cast to `PebbleMood` is gone.
4. **An unknown agent name logs as PebbleVoice**, as before, now through a typed check instead of a cast.
