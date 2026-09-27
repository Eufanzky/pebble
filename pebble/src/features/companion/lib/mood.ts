import type { PebbleMood } from '../types';

/** Pebble's resting mood from how much of today's list is done. */
export function moodForCompletion(percent: number): PebbleMood {
  if (percent >= 100) return 'excited';
  if (percent >= 50) return 'happy';
  if (percent > 0) return 'normal';
  return 'sleepy';
}
