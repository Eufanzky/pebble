'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { usePreferences } from '@/shared/preferences';
import { useTimeOfDay } from '@/shared/hooks/useTimeOfDay';
import { pebbleMessage } from '../lib/messages';
import { moodForCompletion } from '../lib/mood';
import type { PebbleMood } from '../types';

interface PebbleContextValue {
  mood: PebbleMood;
  currentMessage: string;
  setMood: (mood: PebbleMood) => void;
  flashMood: (mood: PebbleMood, durationMs?: number) => void;
  deriveMoodFromCompletion: (completionPct: number, total?: number, completed?: number) => void;
}

const PebbleContext = createContext<PebbleContextValue | null>(null);

export function PebbleProvider({ children }: { children: ReactNode }) {
  const { preferences, stripEmoji } = usePreferences();
  const timeOfDay = useTimeOfDay();
  const [mood, setMoodState] = useState<PebbleMood>('normal');
  const [currentMessage, setCurrentMessage] = useState('');
  const [messageIndex, setMessageIndex] = useState(0);
  const moodOverrideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const baseMood = useRef<PebbleMood>('normal');
  const taskStats = useRef({ taskCount: 0, completedCount: 0 });

  const deriveMoodFromCompletion = useCallback((pct: number) => {
    const derived = moodForCompletion(pct);
    baseMood.current = derived;
    if (!moodOverrideTimer.current) {
      setMoodState(derived);
    }
  }, []);

  const setMood = useCallback((m: PebbleMood) => {
    baseMood.current = m;
    setMoodState(m);
  }, []);

  const flashMood = useCallback((tempMood: PebbleMood, durationMs = 2000) => {
    if (moodOverrideTimer.current) clearTimeout(moodOverrideTimer.current);
    setMoodState(tempMood);
    moodOverrideTimer.current = setTimeout(() => {
      setMoodState(baseMood.current);
      moodOverrideTimer.current = null;
    }, durationMs);
  }, []);

  // Update stats ref (called by TasksContext via deriveMoodFromCompletion)
  const updateTaskStats = useCallback((total: number, completed: number) => {
    taskStats.current = { taskCount: total, completedCount: completed };
  }, []);

  // Rotate messages every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => i + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Select and interpolate message
  useEffect(() => {
    setCurrentMessage(stripEmoji(pebbleMessage(timeOfDay, preferences.pebblePersonality, messageIndex, taskStats.current)));
  }, [messageIndex, timeOfDay, preferences.pebblePersonality, stripEmoji]);

  // Expose updateTaskStats alongside deriveMoodFromCompletion
  const deriveMoodWithStats = useCallback(
    (pct: number, total: number = 0, completed: number = 0) => {
      updateTaskStats(total, completed);
      deriveMoodFromCompletion(pct);
    },
    [updateTaskStats, deriveMoodFromCompletion]
  );

  return (
    <PebbleContext.Provider
      value={{
        mood,
        currentMessage,
        setMood,
        flashMood,
        deriveMoodFromCompletion: deriveMoodWithStats,
      }}
    >
      {children}
    </PebbleContext.Provider>
  );
}

export function usePebble() {
  const ctx = useContext(PebbleContext);
  if (!ctx) throw new Error('usePebble must be used within PebbleProvider');
  return ctx;
}
