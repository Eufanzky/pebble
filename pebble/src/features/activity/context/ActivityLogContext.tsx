'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/shared/hooks/useLocalStorage';
import type { ActivityEntry } from '../types';

interface ActivityLogContextValue {
  entries: ActivityEntry[];
  addEntry: (
    agent: ActivityEntry['agent'],
    action: string,
    reasoning: string,
    safetyStatus?: ActivityEntry['safetyStatus']
  ) => void;
}

const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  // Starts empty: the log only shows what the agents really did
  const [entries, setEntries] = useLocalStorage<ActivityEntry[]>('pebble-activity', []);

  const addEntry = useCallback(
    (
      agent: ActivityEntry['agent'],
      action: string,
      reasoning: string,
      safetyStatus: ActivityEntry['safetyStatus'] = 'passed'
    ) => {
      const entry: ActivityEntry = {
        id: crypto.randomUUID(),
        timestamp: new Date(),
        agent,
        action,
        reasoning,
        safetyStatus,
      };
      setEntries((prev) => [entry, ...prev]);
    },
    [setEntries]
  );

  return (
    <ActivityLogContext.Provider value={{ entries, addEntry }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error('useActivityLog must be used within ActivityLogProvider');
  return ctx;
}
