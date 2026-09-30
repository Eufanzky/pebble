import type { ApiSchema } from '@/shared/api';
import { getJson, postJson } from '@/shared/lib/api';
import type { ActivityEntry } from '../types';

type ActivityEntryOut = ApiSchema<'ActivityEntryOut'>;

/** How much of the log the activity page shows. */
export const LOG_LIMIT = 200;

export function fromApi(entry: ActivityEntryOut): ActivityEntry {
  return { ...entry, timestamp: new Date(entry.timestamp) };
}

export async function listActivity(): Promise<ActivityEntry[]> {
  return (await getJson<ActivityEntryOut[]>(`/api/activity?limit=${LOG_LIMIT}`)).map(fromApi);
}

export async function postActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<ActivityEntry> {
  return fromApi(await postJson<ActivityEntryOut>('/api/activity', entry));
}
