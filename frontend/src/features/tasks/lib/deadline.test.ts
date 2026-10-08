import { describe, expect, it } from 'vitest';
import { isoDay, timeLeft } from './deadline';

// Local times: the bar is about the user's own calendar
const at = (day: number, hour = 12, minute = 0) => new Date(2026, 9, day, hour, minute);
const chosen = at(1, 0).toISOString(); // chosen at midnight on Oct 1; Oct 10 ends at midnight on Oct 11

describe('timeLeft', () => {
  it('is full when the day is chosen and empties evenly to the end of the due day', () => {
    expect(timeLeft('2026-10-10', chosen, at(1, 0)).left).toBe(1);
    expect(timeLeft('2026-10-10', chosen, at(6, 0)).left).toBe(0.5);
    expect(timeLeft('2026-10-10', chosen, at(10, 12)).left).toBeCloseTo(0.05);
  });

  it.each([
    [at(1), '9 days left', false],
    [at(8), '2 days left', false],
    [at(9, 0, 1), 'Due tomorrow', true],
    [at(10, 0), 'Due today', true],
    [at(10, 23, 59), 'Due today', true],
  ])('at %s says %j (near: %s)', (now, label, near) => {
    const result = timeLeft('2026-10-10', chosen, now);

    expect(result).toMatchObject({ label, near, passed: false });
  });

  it('says "Still open" once the day is over, never how long ago it was', () => {
    for (const now of [at(11, 0), at(11, 9), at(30)]) {
      expect(timeLeft('2026-10-10', chosen, now)).toEqual({ left: 0, label: 'Still open', near: false, passed: true });
    }
  });

  it('starts full when it doesn’t know when the day was chosen', () => {
    expect(timeLeft('2026-10-10', null, at(5)).left).toBe(1);
  });

  it('never goes over full for a day chosen "after" now (another device’s clock)', () => {
    expect(timeLeft('2026-10-10', at(6).toISOString(), at(5)).left).toBe(1);
  });

  it('counts calendar days across a clock change', () => {
    // Europe moves the clocks back on Oct 25, 2026; Oct 24 to Oct 26 is still two days
    expect(timeLeft('2026-10-26', null, new Date(2026, 9, 24, 23, 30)).label).toBe('2 days left');
  });
});

describe('isoDay', () => {
  it('is the local calendar day', () => {
    expect(isoDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
