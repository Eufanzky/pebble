import { getJson, postJson } from '@/shared/lib/api';
import type { Stats } from '../types';

/** The user's time zone, so "today" is their today. */
export function timeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export function getStats(days: number, tz: string = timeZone()): Promise<Stats> {
  const params = new URLSearchParams({ days: String(days), tz });
  return getJson<Stats>(`/api/stats?${params}`);
}

/** A focus session is over: its minutes count towards progress. */
export function postFocusSession(minutes: number): Promise<void> {
  return postJson<void>('/api/stats/focus', { minutes });
}
