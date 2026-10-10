/** Where this device keeps when Today was last left (8.5). Device-only: it's a greeting, not account data. */
export const LAST_VISIT_KEY = 'pebble-last-visit';

const DAY = 86_400_000;

const midnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/**
 * Coming back after time away: the last visit ended before yesterday, in the user's calendar. Only a yes
 * or no ever leaves this function, so nothing can say how long it was (principle 1). A first visit, or a
 * value that isn't a date, isn't coming back.
 */
export function isComingBack(lastVisit: string | null, now: Date): boolean {
  if (!lastVisit) return false;
  const last = new Date(lastVisit);
  if (Number.isNaN(last.getTime())) return false;
  return Math.round((midnight(now) - midnight(last)) / DAY) >= 2;
}
