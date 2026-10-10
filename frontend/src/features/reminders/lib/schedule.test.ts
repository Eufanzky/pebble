import { describe, expect, it } from 'vitest';
import { isReminderDue, localDay } from './schedule';

const at = (hour: number, minute = 0, day = 9) => new Date(2026, 9, day, hour, minute);

describe('isReminderDue', () => {
  it('never shows without a time set, which is the default', () => {
    for (let hour = 0; hour < 24; hour++) expect(isReminderDue('', at(hour), null)).toBe(false);
  });

  it.each([
    [at(14, 29), false],
    [at(14, 30), true],
    [at(14, 39), true],
    [at(14, 40), false],
    [at(18, 0), false],
  ])('for 14:30, at %s → %s', (now, expected) => {
    expect(isReminderDue('14:30', now, null)).toBe(expected);
  });

  it('shows once a day', () => {
    expect(isReminderDue('14:30', at(14, 31), '2026-10-09')).toBe(false);
    expect(isReminderDue('14:30', at(14, 31, 10), '2026-10-09')).toBe(true);
  });

  it('ignores a time that isn’t HH:MM', () => {
    expect(isReminderDue('2:30pm', at(14, 30), null)).toBe(false);
  });
});

describe('localDay', () => {
  it('is the local calendar day', () => {
    expect(localDay(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});
