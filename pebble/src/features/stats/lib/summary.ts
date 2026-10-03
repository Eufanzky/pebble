import type { Measure, StatsDay, Totals } from '../types';

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** "1 hour 15 minutes", "25 minutes", "2 hours". */
export function formatMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return plural(rest, 'minute');
  return rest === 0 ? plural(hours, 'hour') : `${plural(hours, 'hour')} ${plural(rest, 'minute')}`;
}

/** "a, b and c" */
function list(parts: string[]): string {
  return parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}`;
}

function finished(totals: Totals): string[] {
  const parts: string[] = [];
  if (totals.steps > 0) parts.push(plural(totals.steps, 'step'));
  if (totals.tasks > 0) parts.push(plural(totals.tasks, 'task'));
  return parts;
}

/**
 * The range in one plain sentence. Specific, never comparing, never counting
 * what didn't happen (principle 1): a quiet range just invites one small step.
 */
export function rangeSentence(totals: Totals, days: number): string {
  const range = days === 1 ? 'Today' : `In the last ${days} days`;
  const done = finished(totals);
  const focus = totals.focusMinutes > 0 ? `focused for ${formatMinutes(totals.focusMinutes)}` : '';
  if (done.length === 0 && !focus) return 'What you finish will add up here. One small step is enough to start.';
  if (done.length === 0) return `${range} you ${focus}.`;
  return `${range} you finished ${list(done)}${focus ? `, and ${focus}` : ''}.`;
}

/** Everything since the start, which only ever grows. */
export function allTimeSentence(totals: Totals): string {
  const parts = [...finished(totals)];
  if (totals.focusMinutes > 0) parts.push(`${formatMinutes(totals.focusMinutes)} of focus`);
  return parts.length === 0 ? '' : `Since you started: ${list(parts)}.`;
}

export const MEASURES: { id: Measure; label: string; unit: (n: number) => string }[] = [
  { id: 'steps', label: 'Steps', unit: (n) => plural(n, 'step') },
  { id: 'tasks', label: 'Tasks', unit: (n) => plural(n, 'task') },
  { id: 'focusMinutes', label: 'Focus minutes', unit: (n) => plural(n, 'minute') },
];

/**
 * A round, even top for the axis (so the middle gridline is a whole number),
 * and its gridlines: 0, the middle and the top.
 */
export function scale(values: number[]): { max: number; ticks: number[] } {
  const highest = Math.max(0, ...values);
  if (highest === 0) return { max: 1, ticks: [0] };
  const step = 10 ** Math.floor(Math.log10(highest));
  const max =
    [1, 2, 3, 4, 5, 6, 8, 10, 20]
      .map((m) => m * step)
      .find((n) => n >= highest && Number.isInteger(n) && n % 2 === 0) ?? Math.ceil(highest / 2) * 2;
  return { max, ticks: [0, max / 2, max] };
}

/** "Sat 3" for a week, "Oct 3" otherwise; ISO dates are read as local calendar days. */
export function dayLabel(iso: string, days: number, locale?: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  if (days <= 7) return `${date.toLocaleDateString(locale, { weekday: 'short' })} ${d}`;
  return date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
}

/** Which days get an x-axis label: all of a week, about one a week otherwise (always the last). */
export function labelledDays(days: StatsDay[]): Set<number> {
  if (days.length <= 7) return new Set(days.map((_, i) => i));
  const every = Math.ceil(days.length / 5);
  return new Set(days.map((_, i) => i).filter((i) => (days.length - 1 - i) % every === 0));
}
