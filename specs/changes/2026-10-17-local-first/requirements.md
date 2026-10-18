# Local first, deploy last: requirements

Change to the roadmap (no item). Branch: `docs/roadmap-local-first`.

## Goal

Make sure the project runs well locally before anything is deployed, and order the remaining phases so that deploying comes last.

## Decisions

- Phase 10 becomes "Runs well locally". The finished 10.1 (Dockerfile) and 10.4 (rate limits) keep their numbers, because the code and tests cite them. It gains 10.5 (local setup that just works), 10.6 (a smoke test against any URL), 10.7 (honest safety labels) and 10.8 (self-hosted fonts).
- Phase 11 (presentation) keeps only what can be done before going live: the diagram, and the README with screenshots from the local app.
- Phase 12 is deploy: the old 10.2 and 10.3 become 12.1 and 12.2, the old 11.3 (production smoke test) becomes 12.3 and reuses the 10.6 suite, and the new 12.4 adds the live link and the hosts.
- Problems found while running the app go in `audit.md` (A-037 to A-039), each linked to the item that fixes it.
