# 3.8 Frontend coverage floor: validation

- [x] `npm run test:coverage`: 99.1% statements, 96.0% branches, 97.6% functions, 99.8% lines; exit 0.
- [x] With only `tasks/lib/today.test.ts`, it reports 4.3% lines and exits 1 ("does not meet global threshold (80%)").
- [x] CI runs the floor and is green on this PR.
