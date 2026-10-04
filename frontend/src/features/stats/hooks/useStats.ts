'use client';

import { useQuery } from '@tanstack/react-query';
import { getStats } from '../api/stats';

export const STATS_KEY = ['stats'] as const;

/** The user's progress over the last `days` days; fetched fresh each time the page opens. */
export function useStats(days: number) {
  return useQuery({ queryKey: [...STATS_KEY, days], queryFn: () => getStats(days), staleTime: 0 });
}
