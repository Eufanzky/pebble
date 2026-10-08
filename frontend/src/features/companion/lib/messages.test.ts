import { describe, expect, it } from 'vitest';
import type { TimeOfDay } from '@/shared/hooks/useTimeOfDay';
import type { PebblePersonality } from '@/shared/preferences';
import { messages } from '../data/pebbleMessages';
import { interpolateMessage, pebbleMessage } from './messages';

const times = Object.keys(messages) as TimeOfDay[];
const personalities = Object.keys(messages.morning) as PebblePersonality[];
const pools = times.flatMap((time) => personalities.map((personality) => [time, personality] as const));

describe('interpolateMessage', () => {
  it('fills in the task counts', () => {
    expect(interpolateMessage('{completedCount} of {taskCount}, {completedCount}!', { taskCount: 4, completedCount: 2 }))
      .toBe('2 of 4, 2!');
  });

  it('names what it counts, in the singular for one', () => {
    expect(interpolateMessage('{taskCount things}, {completedCount tasks}', { taskCount: 3, completedCount: 1 }))
      .toBe('3 things, 1 task');
  });
});

describe('pebbleMessage', () => {
  it('picks the line for the time of day and personality, and wraps around', () => {
    const pool = messages.evening.calm;
    const stats = { taskCount: 0, completedCount: 0 };

    expect(pebbleMessage('evening', 'calm', 0, stats)).toBe(pool[0]);
    expect(pebbleMessage('evening', 'calm', pool.length + 1, stats)).toBe(pool[1]);
  });

  it.each(pools)('never shows a count of zero (%s, %s)', (time, personality) => {
    const stats = { taskCount: 0, completedCount: 0 };
    const shown = messages[time][personality].map((_, i) => pebbleMessage(time, personality, i, stats));

    expect(shown.filter((line) => /\b0\b/.test(line))).toEqual([]);
  });

  it('shows the count lines once there is something to count', () => {
    const stats = { taskCount: 3, completedCount: 1 };
    const shown = messages.day.gentle.map((_, i) => pebbleMessage('day', 'gentle', i, stats));

    expect(shown).toContain("You finished 1 thing already. That counts.");
  });

  it.each(pools)('has a line for a new account (%s, %s)', (time, personality) => {
    const stats = { taskCount: 0, completedCount: 0 };

    expect(pebbleMessage(time, personality, 0, stats)).not.toMatch(/\{|\}/);
  });
});
