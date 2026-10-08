export interface TimeLeft {
  /** How much of the time from choosing the day to the end of it is still left, 0 to 1. */
  left: number;
  /** "3 days left", "Due tomorrow", "Due today", or "Still open" once the day is over. */
  label: string;
  /** Due today or tomorrow: Pebble offers to make the task smaller. */
  near: boolean;
  /** The day is over. The task is still open, never "late" (principle 1). */
  passed: boolean;
}

const DAY = 86_400_000;

/** Local midnight at the start of a YYYY-MM-DD day. */
function localDay(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

const midnight = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

/**
 * The time-left bar for a task due on `due` (8.3). The bar starts full when the day was chosen (`setAt`)
 * and empties evenly until the end of the due day, in the user's calendar. Days are counted between
 * local midnights, so a clock change doesn't shift them.
 */
export function timeLeft(due: string, setAt: string | null | undefined, now: Date): TimeLeft {
  const dueDay = localDay(due);
  const days = Math.round((dueDay.getTime() - midnight(now).getTime()) / DAY);
  if (days < 0) return { left: 0, label: 'Still open', near: false, passed: true };

  const end = new Date(dueDay.getFullYear(), dueDay.getMonth(), dueDay.getDate() + 1).getTime();
  const start = setAt ? Math.min(new Date(setAt).getTime(), now.getTime()) : now.getTime();
  const left = Math.min(1, Math.max(0, (end - now.getTime()) / (end - start)));
  const label = days === 0 ? 'Due today' : days === 1 ? 'Due tomorrow' : `${days} days left`;
  return { left, label, near: days <= 1, passed: false };
}

/** A YYYY-MM-DD day in the user's calendar, for the date field. */
export function isoDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
