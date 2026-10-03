import { describe, expect, it } from 'vitest';
import { allTimeSentence, dayLabel, formatMinutes, labelledDays, rangeSentence, scale } from './summary';

const totals = (steps: number, tasks: number, focusMinutes: number) => ({ steps, tasks, focusMinutes });

describe('formatMinutes', () => {
  it.each([
    [1, '1 minute'],
    [25, '25 minutes'],
    [60, '1 hour'],
    [75, '1 hour 15 minutes'],
    [121, '2 hours 1 minute'],
  ])('%i is "%s"', (minutes, text) => {
    expect(formatMinutes(minutes)).toBe(text);
  });
});

describe('rangeSentence', () => {
  it('says what was finished, specifically', () => {
    expect(rangeSentence(totals(12, 4, 75), 7)).toBe(
      'In the last 7 days you finished 12 steps and 4 tasks, and focused for 1 hour 15 minutes.',
    );
    expect(rangeSentence(totals(1, 0, 0), 30)).toBe('In the last 30 days you finished 1 step.');
    expect(rangeSentence(totals(0, 1, 0), 1)).toBe('Today you finished 1 task.');
    expect(rangeSentence(totals(0, 0, 25), 7)).toBe('In the last 7 days you focused for 25 minutes.');
  });

  it('never counts what did not happen: a quiet range invites one small step', () => {
    const quiet = rangeSentence(totals(0, 0, 0), 7);

    expect(quiet).toBe('What you finish will add up here. One small step is enough to start.');
    expect(quiet).not.toMatch(/\b0\b|nothing|missed|no /i);
  });
});

describe('allTimeSentence', () => {
  it('lists everything since the start, or nothing at all', () => {
    expect(allTimeSentence(totals(48, 15, 360))).toBe('Since you started: 48 steps, 15 tasks and 6 hours of focus.');
    expect(allTimeSentence(totals(0, 0, 25))).toBe('Since you started: 25 minutes of focus.');
    expect(allTimeSentence(totals(0, 0, 0))).toBe('');
  });
});

describe('scale', () => {
  it.each([
    [[0, 0], 1, [0]],
    [[1], 2, [0, 1, 2]],
    [[3, 1], 4, [0, 2, 4]],
    [[5], 6, [0, 3, 6]],
    [[7], 8, [0, 4, 8]],
    [[23], 30, [0, 15, 30]],
    [[90, 40], 100, [0, 50, 100]],
  ])('%j tops out at %i', (values, max, ticks) => {
    expect(scale(values)).toEqual({ max, ticks });
  });

  it('always reaches the highest value', () => {
    for (const n of [1, 2, 3, 5, 9, 11, 19, 33, 101, 999]) expect(scale([n]).max).toBeGreaterThanOrEqual(n);
  });
});

describe('day labels', () => {
  it('names a week by weekday, a month by date, as local calendar days', () => {
    expect(dayLabel('2026-10-03', 7, 'en-US')).toBe('Sat 3');
    expect(dayLabel('2026-10-03', 30, 'en-US')).toBe('Oct 3');
  });

  it('labels every day of a week, and about one a week of a month, always the last', () => {
    const days = (n: number) => Array.from({ length: n }, (_, i) => ({ date: `d${i}`, steps: 0, tasks: 0, focusMinutes: 0 }));

    expect([...labelledDays(days(7))]).toEqual([0, 1, 2, 3, 4, 5, 6]);
    const month = [...labelledDays(days(30))];
    expect(month).toContain(29);
    expect(month.length).toBeLessThanOrEqual(6);
  });
});
