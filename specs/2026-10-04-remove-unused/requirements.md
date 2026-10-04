# 6.1 Remove what isn't used: requirements

Roadmap item: **6.1** (Phase 6, tidy up and document). Branch: `chore/6.1-remove-unused`.

## Goal

Main holds only the real app: no prototypes, stubs, boilerplate or dead code.

## Removed

- `demo/`: the hackathon's vanilla-JS prototype, not wired to anything.
- `docs/`: the hackathon slides (.pptx) and the outdated architecture PNG. The README now points to the `v0.1.0-hackathon` release for both; 6.3 draws a current diagram in Mermaid.
- `pebble/api/`, `pebble/docs/`, `pebble/presentation/`: one-line placeholder READMEs.
- `pebble/README.md`: create-next-app boilerplate.
- Both `favicon.ico` files (identical, and the default create-next-app triangle, not Pebble) and the older `public/favicon.svg`. The browser icon is `app/icon.svg` (Pebble with ears), linked by Next.js.
- Dead code: `pebbleTips` (never shown). Twenty-odd symbols exported but only used in their own file are no longer exported, and unused re-exports leave the feature indexes.

## Kept in check from now on

- Frontend: `knip` (`npm run lint:dead`, `knip.json`), in CI. It ignores `public/sw.js` (loaded by the browser, not imported) and the `uv` binary (the backend's tool). `postcss` is listed as a dev dependency, which the config already used.
- Backend: `vulture` (`[tool.vulture]` in `pyproject.toml`), in CI, at its strictest confidence. It ignores what frameworks call: route functions, Pydantic `model_config` and response fields, enum members, the middleware's `dispatch`, `pytestmark`, and a python-docx property.

## Decisions

1. **Nothing is lost.** Everything removed from main is in the `v0.1.0-hackathon` tag and release, which the README links to.
2. **Merged remote branches are not touched here.** Deleting branches on GitHub isn't a file change; it's listed for the user to decide.
