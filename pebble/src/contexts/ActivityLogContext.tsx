'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { sampleActivityEntries } from '@/data/activityEntries';
import type { ActivityEntry } from '@/lib/types';

interface ActivityLogContextValue {
  entries: ActivityEntry[];
  setEntries: (value: ActivityEntry[] | ((prev: ActivityEntry[]) => ActivityEntry[])) => void;
  addEntry: (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => void;
}

const ActivityLogContext = createContext<ActivityLogContextValue | null>(null);

export function ActivityLogProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useLocalStorage<ActivityEntry[]>(
    'pebble_activity',
    sampleActivityEntries
  );

  const addEntry = (entry: Omit<ActivityEntry, 'id' | 'timestamp'>) => {
    const newEntry: ActivityEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setEntries((prev) => [newEntry, ...prev]);
  };

  return (
    <ActivityLogContext.Provider value={{ entries, setEntries, addEntry }}>
      {children}
    </ActivityLogContext.Provider>
  );
}

export function useActivityLog() {
  const ctx = useContext(ActivityLogContext);
  if (!ctx) throw new Error('useActivityLog must be used within ActivityLogProvider');
  return ctx;
}
