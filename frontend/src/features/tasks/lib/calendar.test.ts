import { describe, expect, it } from 'vitest';
import { calendarFileName, localIso, nextQuarterHour } from './calendar';

describe('nextQuarterHour', () => {
  it.each([
    ['09:00:00', '09:00'],
    ['09:00:30', '09:15'],
    ['09:01:00', '09:15'],
    ['09:15:00', '09:15'],
    ['09:46:00', '10:00'],
    ['23:50:00', '00:00'],
  ])('%s starts at %s', (time, start) => {
    const next = nextQuarterHour(new Date(`2026-10-06T${time}`));

    expect(`${String(next.getHours()).padStart(2, '0')}:${String(next.getMinutes()).padStart(2, '0')}`).toBe(start);
    expect(next.getSeconds()).toBe(0);
  });
});

describe('localIso', () => {
  it('is the local time with its offset, and means the same moment', () => {
    const date = new Date('2026-10-06T09:15:00Z');

    const iso = localIso(date);

    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
    expect(new Date(iso).getTime()).toBe(date.getTime());
  });
});

describe('calendarFileName', () => {
  it.each([
    ['Read Chapter 4', 'read-chapter-4.ics'],
    ['  Email Sam, then Jo!  ', 'email-sam-then-jo.ics'],
    ['🙂', 'pebble-plan.ics'],
  ])('%s → %s', (title, name) => {
    expect(calendarFileName(title)).toBe(name);
  });
});
