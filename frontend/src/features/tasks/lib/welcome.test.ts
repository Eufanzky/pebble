import { describe, expect, it } from 'vitest';
import { isComingBack } from './welcome';

const now = new Date(2026, 9, 9, 10); // Friday, October 9, 10:00 local time
const at = (day: number, hour = 12) => new Date(2026, 9, day, hour).toISOString();

describe('isComingBack', () => {
  it.each([
    ['earlier today', at(9, 8), false],
    ['late yesterday', at(8, 23), false],
    ['early yesterday', at(8, 0), false],
    ['the day before yesterday', at(7, 23), true],
    ['a month ago', new Date(2026, 8, 1).toISOString(), true],
    ['a year ago', new Date(2025, 9, 9).toISOString(), true],
  ])('a last visit %s → %s', (_, lastVisit, expected) => {
    expect(isComingBack(lastVisit, now)).toBe(expected);
  });

  it('is never coming back on a first visit, or from a damaged value', () => {
    expect(isComingBack(null, now)).toBe(false);
    expect(isComingBack('not a date', now)).toBe(false);
  });

  it('counts calendar days across a clock change', () => {
    // Europe moves the clocks back on Oct 25, 2026
    expect(isComingBack(new Date(2026, 9, 24, 23, 30).toISOString(), new Date(2026, 9, 26, 0, 30))).toBe(true);
    expect(isComingBack(new Date(2026, 9, 25, 0, 30).toISOString(), new Date(2026, 9, 26, 23, 30))).toBe(false);
  });
});
