# 6.3 Docs up to date: requirements

Roadmap item: **6.3** (Phase 6). Branch: `docs/6.3-docs-up-to-date`.

## Goal

Someone new can understand, run and test Pebble from the docs alone, and nothing the docs say is out of date or untested.

## Scope

- **README.md**, rewritten: what each part of the app does (Today, chat, documents, focus, stats, activity, Pebble, the account, accessibility), a Mermaid diagram of how the parts connect (browser → Next.js with Auth.js and the signing proxy → FastAPI's layers → Postgres, the LLM and the optional Azure services), the agents and their status, local setup in five commands, every test and check command, where things are, and the principles. It replaces the hackathon slides and PNG removed in 6.1 and points to the `v0.1.0-hackathon` release for them.
- **backend/README.md:** progress and stats, vulture, the newer ports, routers and modules, and the integration tests' full scope.
- **CLAUDE.md**, restructured into short sections (what this is, specs and workflow, commands, CI, testing, frontend, backend, product constraints), with the one 4,000-word paragraph split up, an empty heading removed, and stale notes fixed (the "old layout" note, the E2E's scope).
- **specs/tech-stack.md:** Node 22.13+, the dead-code tools, hosting marked as planned, the proxy route instead of a rewrite, the real token claims, the shell's path, and the features and shared folders as they are. WhyBot is marked as joining the pipeline in 7.1.
- **specs/testing.md:** the real test layout, the whole E2E scope, the token, link and dead-code checks, and the commands as they are; items that wait for later phases are marked with their item.
- **specs/audit.md:** stale phase numbers and statuses fixed, plus three new findings (A-024 "Focusbuddy" in prompts, A-025 knip@5's advisories, A-026 a fixture that doesn't regenerate byte for byte).
- **specs/roadmap.md:** 10.3 names `BACKEND_URL` and `AUTH_TOKEN_SECRET` rather than a rewrite.

## Decisions

1. **README claims only what's built and tested.** Planned agents are in the table as "Planned" with their roadmap item.
2. **Prompt wording isn't touched here.** Renaming "Focusbuddy" in the prompts changes model input, so it goes with the next prompt change and its eval run (7.1), not into a docs PR.
3. **knip's advisories get their own small fix PR**, so this PR stays docs only.
