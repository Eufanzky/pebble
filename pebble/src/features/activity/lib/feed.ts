import type { ActivityEntry } from '../types';

export const PAGE_SIZE = 8;

/**
 * The entries for one agent (or 'All'), newest first. Stored timestamps come
 * back from localStorage as strings, so both forms are accepted.
 */
export function feedEntries(entries: ActivityEntry[], filter: string): ActivityEntry[] {
  const filtered = filter === 'All' ? entries : entries.filter((e) => e.agent === filter);
  return [...filtered].sort((a, b) => timeOf(b.timestamp) - timeOf(a.timestamp));
}

function timeOf(timestamp: Date | string): number {
  return (timestamp instanceof Date ? timestamp : new Date(timestamp)).getTime();
}

/** "3:05 PM"; empty when the timestamp can't be read. */
export function entryTime(timestamp: Date | string): string {
  const d = timestamp instanceof Date ? timestamp : new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

/** The "show more" label, or null when everything is shown. */
export function showMoreLabel(remaining: number): string | null {
  if (remaining <= 0) return null;
  return `Show ${Math.min(remaining, PAGE_SIZE)} more${remaining > PAGE_SIZE ? ` of ${remaining}` : ''}`;
}
