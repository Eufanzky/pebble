import type { TimeOfDay } from '@/shared/hooks/useTimeOfDay';
import type { PebblePersonality } from '@/shared/preferences';
import { messages } from '../data/pebbleMessages';

interface Counts {
  taskCount: number;
  completedCount: number;
}

const PLACEHOLDER = /\{(taskCount|completedCount)(?: (\w+))?\}/g;

/** The `index`-th line for this time of day and personality, with the counts filled in. */
export function pebbleMessage(timeOfDay: TimeOfDay, personality: PebblePersonality, index: number, stats: Counts): string {
  const pool = messages[timeOfDay][personality].filter((message) => fits(message, stats));
  return interpolateMessage(pool[index % pool.length], stats);
}

/** A line fits when every count it names is above zero: no "You finished 0 things" (A-023). */
function fits(message: string, stats: Counts): boolean {
  return [...message.matchAll(PLACEHOLDER)].every(([, name]) => stats[name as keyof Counts] > 0);
}

/** Fills in `{taskCount}` and `{completedCount}`, and `{taskCount things}` as "1 thing" or "3 things". */
export function interpolateMessage(message: string, vars: Counts): string {
  return message.replace(PLACEHOLDER, (_, name: keyof Counts, noun?: string) => {
    const n = vars[name];
    if (!noun) return String(n);
    return `${n} ${n === 1 ? noun.replace(/s$/, '') : noun}`;
  });
}
