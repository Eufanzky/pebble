'use client';

import { createContext, useCallback, useContext, useRef, type ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { listActivity, postActivity } from '../api/activity';
import type { ActivityEntry } from '../types';

const ACTIVITY_KEY = ['activity'] as const;

interface ActivityLogContextValue {
  entries: ActivityEntry[];
  isLoading: boolean;
  loadFailed: boolean;
  /** Log something the user did. The agents log their own results on the server. */
  addEntry: (
    agent: ActivityEntry['agent'],
    action: string,
    reasoning: string,
    safetyStatus?: ActivityEntry['safetyStatus']
  ) => void;
  /** Reload the log, e.g. after a chat turn the backend logged. */
  refresh: () => void;
}

const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

/**
 * The activity log, from the account (`/api/activity`), newest first. An entry
 * shows at once and is saved in the background, in order.
 */
export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const query = useQuery({ queryKey: ACTIVITY_KEY, queryFn: listActivity });
  const queue = useRef<Promise<unknown>>(Promise.resolve());

  const addEntry = useCallback(
    (
      agent: ActivityEntry['agent'],
      action: string,
      reasoning: string,
      safetyStatus: ActivityEntry['safetyStatus'] = 'passed'
    ) => {
      if (client.getQueryData(ACTIVITY_KEY) === undefined) {
        // The first load is still on its way and would replace an entry shown now: save, then reload
        queue.current = queue.current
          .then(() => postActivity({ agent, action, reasoning, safetyStatus }))
          .catch(() => undefined)
          .then(() => client.invalidateQueries({ queryKey: ACTIVITY_KEY }));
        return;
      }
      const local: ActivityEntry = { id: `temp-${crypto.randomUUID()}`, timestamp: new Date(), agent, action, reasoning, safetyStatus };
      client.setQueryData<ActivityEntry[]>(ACTIVITY_KEY, (prev) => [local, ...(prev ?? [])]);
      queue.current = queue.current
        .then(async () => {
          const saved = await postActivity({ agent, action, reasoning, safetyStatus });
          client.setQueryData<ActivityEntry[]>(ACTIVITY_KEY, (prev) =>
            (prev ?? []).map((e) => (e.id === local.id ? saved : e)),
          );
        })
        .catch(() => void client.invalidateQueries({ queryKey: ACTIVITY_KEY }));
    },
    [client],
  );

  const refresh = useCallback(() => {
    // After the saves already under way, so the reload includes them
    queue.current = queue.current.then(() => client.invalidateQueries({ queryKey: ACTIVITY_KEY }));
  }, [client]);

  return (
    <ActivityLogContext.Provider
      value={{
        entries: query.data ?? [],
        isLoading: query.isPending,
        loadFailed: query.isError,
        addEntry,
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
