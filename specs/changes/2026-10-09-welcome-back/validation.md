# 8.5 Welcome back: validation

- [x] Fixed clock: `welcome.test.ts` (today, yesterday, the day before, a month, a year, a clock change, a first visit, a damaged value); `today.test.ts` (fresh at every time of day, whatever was done); `TodayView.test.tsx` (fresh after three days and five weeks with no length in the text, usual after today, yesterday or a first visit, and a tab hidden then shown days later).
- [x] Guilt scan: the new patterns catch "Welcome back after 6 days!", "3 weeks ago" and "after a few days off", and allow the new copy.
- [x] Frontend lint, knip, `tsc --noEmit`, `npm test` (740).
