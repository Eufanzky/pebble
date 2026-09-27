import { describe, expect, it } from 'vitest';
import { FOCUS_SECONDS, RING_CIRCUMFERENCE, formatTime, ringOffset, seatPosition } from './timer';

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

describe('seatPosition', () => {
  it('starts at the top and goes round clockwise', () => {
    expect(seatPosition(0, 4)).toEqual({ x: 142, y: 12 });
    const right = seatPosition(1, 4);
    expect(right.x).toBeCloseTo(272);
    expect(right.y).toBeCloseTo(142);
  });
});
