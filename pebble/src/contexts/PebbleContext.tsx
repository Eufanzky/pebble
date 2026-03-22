'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PebbleMood } from '@/lib/types';

interface PebbleContextValue {
  mood: PebbleMood;
  setMood: (mood: PebbleMood) => void;
  flashMood: (mood: PebbleMood, durationMs?: number) => void;
}

const PebbleContext = createContext<PebbleContextValue | null>(null);

export function PebbleProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<PebbleMood>('normal');

  const flashMood = useCallback((tempMood: PebbleMood, durationMs = 2000) => {
    setMood(tempMood);
    setTimeout(() => setMood('normal'), durationMs);
  }, []);

  return (
    <PebbleContext.Provider value={{ mood, setMood, flashMood }}>
      {children}
    </PebbleContext.Provider>
  );
}

export function usePebble() {
  const ctx = useContext(PebbleContext);
  if (!ctx) throw new Error('usePebble must be used within PebbleProvider');
  return ctx;
}
