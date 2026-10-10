/** The reminder's words, in the app and in a notification: an offer, never a push. */
export const REMINDER_TEXT = 'Your reminder: want to pick one small thing?';

/** How long after the set time a reminder can still show. Opening Pebble hours later shows nothing. */
const REMINDER_WINDOW_MINUTES = 10;

/** A YYYY-MM-DD day in the user's calendar. */
export function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Whether the reminder the user set (`time`, HH:MM; '' is none) should show now (8.6): from that minute
 * of the day for a few minutes, and once a day (`shownOn` is the last day it showed). No time set, no
 * reminder: nothing in Pebble reminds anyone of anything on its own.
 */
export function isReminderDue(time: string, now: Date, shownOn: string | null): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return false;
  if (shownOn === localDay(now)) return false;
  const at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(match[1]), Number(match[2]));
  const minutesSince = (now.getTime() - at.getTime()) / 60_000;
  return minutesSince >= 0 && minutesSince < REMINDER_WINDOW_MINUTES;
}
