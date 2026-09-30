# 4.3 Auth.js: validation

- [x] Backend: a valid token is the user; missing, expired, wrong-secret, unsigned, wrong issuer or audience, and missing claims are 401; no secret is 503 (`tests/api/test_auth.py`).
- [x] The token signer and the forwarder: claims and lifetime, method/path/query/body, no cookies forwarded, filtered response headers, 204, and a gentle 503 when the backend is unreachable.
- [x] Provider switches, dev login names, `provider:account` ids, and same-site callback URLs.
- [x] Sign-in view: only configured providers, redirect target, dev login, Pebble waking on focus, error and empty states, axe.
- [x] E2E: dev login, then the demo flow; signed out, pages redirect to `/signin` and the API answers 401; sign out works; axe on every page and `/signin`.
- [x] `npm test`, coverage floor, lint, `tsc --noEmit`, `npm run build`; backend `pytest`, floors and `ruff check`.
