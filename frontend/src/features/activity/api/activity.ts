import type { ApiSchema } from '@/shared/api';
import { getJson } from '@/shared/lib/api';
import type { ActivityEntry } from '../types';

type ActivityEntryOut = ApiSchema<'ActivityEntryOut'>;

/** How much of the log the activity page shows. */
const LOG_LIMIT = 200;

function fromApi(entry: ActivityEntryOut): ActivityEntry {
  return { ...entry, timestamp: new Date(entry.timestamp) };
}

export async function listActivity(): Promise<ActivityEntry[]> {
  return (await getJson<ActivityEntryOut[]>(`/api/activity?limit=${LOG_LIMIT}`)).map(fromApi);
}
