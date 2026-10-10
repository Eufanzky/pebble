import { describe, expect, it } from 'vitest';
import { FOCUS_SECONDS, RING_CIRCUMFERENCE, formatTime, minutesFocused, ringOffset, stoppedMessage } from './timer';

describe('formatTime', () => {
  it.each([[1500, '25:00'], [61, '01:01'], [9, '00:09'], [0, '00:00']])('%i → %s', (seconds, text) => {
    expect(formatTime(seconds)).toBe(text);
  });
});

describe('ringOffset', () => {
  it('draws nothing at the start, half at halfway, all at the end', () => {
    expect(ringOffset(FOCUS_SECONDS)).toBeCloseTo(RING_CIRCUMFERENCE);
    expect(ringOffset(FOCUS_SECONDS / 2)).toBeCloseTo(RING_CIRCUMFERENCE / 2);
    expect(ringOffset(0)).toBeCloseTo(0);
  });
});

describe('minutesFocused', () => {
  it.each([[0, 0], [59, 0], [60, 1], [12 * 60 + 59, 12], [FOCUS_SECONDS, 25]])('%i s → %i min', (seconds, minutes) => {
    expect(minutesFocused(seconds)).toBe(minutes);
  });
});

describe('stoppedMessage', () => {
  it('counts what was focused, without comparing it with a full session', () => {
    expect(stoppedMessage(12)).toBe('You focused for 12 minutes. That counts.');
    expect(stoppedMessage(1)).toBe('You focused for 1 minute. That counts.');
    expect(stoppedMessage(0)).toBe('Stopped. Come back whenever you like.');
    for (const m of [0, 1, 12, 24]) expect(stoppedMessage(m)).not.toMatch(/only|25|left|short|early/i);
  });
});
