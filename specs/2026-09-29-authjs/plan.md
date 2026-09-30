# 4.3 Auth.js: plan

1. Backend: `get_current_user` with HS256 tokens, remove Entra and `DEV_MODE`, rename the dependency, rewrite `test_auth.py`, add an autouse test secret.
2. Frontend: install Auth.js and jose; `features/auth` lib (token, forward, providers) with node-environment tests.
3. Auth.js config, `/api/auth/*`, the `/api/*` proxy route, `proxy.ts`; drop the rewrite; move routes into `app/(app)`.
4. `SignInView` and `AccountSection`, with component and axe tests.
5. E2E with the dev login; `.env.example`; docs; roadmap tick.
