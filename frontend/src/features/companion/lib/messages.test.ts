import { describe, expect, it } from 'vitest';
import { messages } from '../data/pebbleMessages';
import { interpolateMessage, pebbleMessage } from './messages';

describe('interpolateMessage', () => {
  it('fills in the task counts', () => {
    expect(interpolateMessage('{completedCount} of {taskCount}, {completedCount}!', { taskCount: 4, completedCount: 2 }))
      .toBe('2 of 4, 2!');
  });
});

describe('pebbleMessage', () => {
  it('picks the line for the time of day and personality, and wraps around', () => {
    const pool = messages.evening.calm;
    const stats = { taskCount: 0, completedCount: 0 };

    expect(pebbleMessage('evening', 'calm', 0, stats)).toBe(pool[0]);
    expect(pebbleMessage('evening', 'calm', pool.length + 1, stats)).toBe(pool[1]);
  });
});
