import type { TimeOfDay } from '@/shared/hooks/useTimeOfDay';
import type { PebblePersonality } from '@/shared/preferences';
import { messages } from '../data/pebbleMessages';

/** The `index`-th line for this time of day and personality, with the counts filled in. */
export function pebbleMessage(
  timeOfDay: TimeOfDay,
  personality: PebblePersonality,
  index: number,
  stats: { taskCount: number; completedCount: number },
): string {
  const pool = messages[timeOfDay][personality];
  return interpolateMessage(pool[index % pool.length], stats);
}

/** Fills `{taskCount}` and `{completedCount}` into a message. */
export function interpolateMessage(
  message: string,
  vars: { taskCount: number; completedCount: number }
): string {
  return message
    .replace(/\{taskCount\}/g, String(vars.taskCount))
    .replace(/\{completedCount\}/g, String(vars.completedCount));
}
