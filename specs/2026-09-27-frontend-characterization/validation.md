# 1.4 Frontend characterization tests: validation

Run from `pebble/`.

- [x] `npm test` passes, with no stderr noise.
- [x] `npm run lint` and `npm run build` pass.
- [x] `git diff main -- src` shows no changes outside `src/test/` and the new test files.
- [x] Each of these hand-made breaks fails at least one test:
  - [x] the `happy` threshold moves from 50% to 60%
  - [x] the excited flash lasts 1 second instead of 2
  - [x] `reduce-animations` is always set
  - [x] chat errors are not shown
  - [x] toggling a step always checks it
- [x] A-014 is logged in `specs/audit.md`, and 1.4 is ticked in `specs/roadmap.md`.
