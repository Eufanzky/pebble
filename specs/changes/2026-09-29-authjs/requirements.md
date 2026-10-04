# 4.3 Auth.js: requirements

Roadmap item: **4.3** (Phase 4). Branch: `feat/4.3-authjs`.

## Goal

Real sign-in. Users sign in with GitHub or Google through Auth.js in Next.js; the Next.js server signs a short-lived token for every backend call; FastAPI checks it in `get_current_user`. Entra ID and the `DEV_MODE` bypass are gone, and a dev login covers local use and E2E.

## Scope

- Frontend: `next-auth@5.0.0-beta.32` (pinned) and `jose`. `features/auth`: the Auth.js config, `signBackendToken`, `forwardToBackend`, provider switches, `SignInView` (`/signin`), `AccountSection` (settings, sign out). `src/proxy.ts` guards every page. `app/api/[...path]/route.ts` replaces the `/api` rewrite. App routes move into the `app/(app)` group so `/signin` has no shell.
- Backend: `get_current_user` verifies HS256 tokens (`AUTH_TOKEN_SECRET`); Entra settings, JWKS fetching and `DEV_MODE` are removed.
- E2E: signs in with the dev login; checks the signed-out redirect, the 401 and signing out; scans `/signin` with axe.
- `.env.example` for the frontend; docs.

## Decisions

1. **The backend never reads the Auth.js cookie.** As `tech-stack.md` says, the Next.js server signs a separate 5-minute token for each proxied call. It's HS256 with a shared secret: one secret to set, no key server.
2. **A proxy route replaces the rewrite.** A rewrite can't add a per-user header. The route forwards only `accept` and `content-type` (never cookies), passes back only `content-type` and `Retry-After`, and turns an unreachable backend into the usual gentle 503.
3. **User ids are `provider:accountId`** (`github:123`, `google:456`, `dev:sam`), so two providers can't collide. There's no users table: the backend only needs the id.
4. **The dev login is a Credentials provider behind `AUTH_DEV_LOGIN=true`.** Any name, no password. It's for local use and E2E; the README and `.env.example` say never to enable it in production.
5. **Providers turn on by configuration.** GitHub or Google appear only when their id and secret are set; with none, the sign-in page says how to set one up.
6. **No secret, no sign-in.** A backend without `AUTH_TOKEN_SECRET` answers 503 on signed-in endpoints instead of accepting anyone; the frontend proxy does the same.
7. **Every page needs sign-in.** Tasks, preferences and the log move to the account in 4.4 and 4.5, so there is no signed-out mode. Features keep their localStorage state until then.
8. **A server entry point for features.** `@/features/<name>/server` is allowed by ESLint next to `index.ts`, so server-only code (Auth.js, token signing) never reaches a client bundle.
9. **The sign-in page is Pebble's.** The app's dark palette, Baloo 2 and Nunito, the bedroom scene, and Pebble dozing until a way to sign in is hovered or focused (no motion with reduced motion).
