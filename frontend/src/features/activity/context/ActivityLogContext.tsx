'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listActivity } from '../api/activity';
import type { ActivityEntry } from '../types';

const ACTIVITY_KEY = ['activity'] as const;

interface ActivityLogContextValue {
  entries: ActivityEntry[];
  isLoading: boolean;
  loadFailed: boolean;
  /** Reload the log after an agent answered: the backend writes every entry (7.3). */
  refresh: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

/**
 * The activity log, from the account (`/api/activity`), newest first. It's read-only here: only what an agent
 * did is logged in its name, and the backend writes it (7.3).
 */
export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ACTIVITY_KEY, queryFn: listActivity });

  const refresh = useCallback(() => {
    void client.invalidateQueries({ queryKey: ACTIVITY_KEY });
  }, [client]);

  return (
    <ActivityLogContext.Provider
      value={{
        entries: query.data ?? [],
        isLoading: query.isPending,
        loadFailed: query.isError,
        refresh,
      }}
    >
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error('useActivityLog must be used within ActivityLogProvider');
  return ctx;
}
