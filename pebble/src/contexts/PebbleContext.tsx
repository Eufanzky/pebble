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
import { usePreferences } from './PreferencesContext';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { messages } from '@/data/pebbleMessages';
import type { PebbleMood } from '@/lib/types';

interface PebbleContextValue {
  mood: PebbleMood;
  currentMessage: string;
  setMood: (mood: PebbleMood) => void;
  flashMood: (mood: PebbleMood, durationMs?: number) => void;
  deriveMoodFromCompletion: (completionPct: number) => void;
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

  // Derive mood from task completion percentage
  const deriveMoodFromCompletion = useCallback((pct: number) => {
    let derived: PebbleMood;
    if (pct >= 100) derived = 'excited';
    else if (pct >= 50) derived = 'happy';
    else if (pct > 0) derived = 'normal';
    else derived = 'sleepy';
    baseMood.current = derived;
    // Only update display mood if there's no active override
    if (!moodOverrideTimer.current) {
      setMoodState(derived);
    }
  }, []);

  // Set mood directly
  const setMood = useCallback((m: PebbleMood) => {
    baseMood.current = m;
    setMoodState(m);
  }, []);

  // Temporary mood flash (e.g., excited on task completion)
  const flashMood = useCallback((tempMood: PebbleMood, durationMs = 2000) => {
    if (moodOverrideTimer.current) clearTimeout(moodOverrideTimer.current);
    setMoodState(tempMood);
    moodOverrideTimer.current = setTimeout(() => {
      setMoodState(baseMood.current);
      moodOverrideTimer.current = null;
    }, durationMs);
  }, []);

  // Rotate messages every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => i + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Select message based on time of day, mood, personality, and index
  useEffect(() => {
    const pool = messages[preferences.pebblePersonality];
    let bucket: string[];
    if (timeOfDay === 'evening') {
      bucket = pool.late;
    } else if (mood === 'excited') {
      bucket = pool.done;
    } else if (mood === 'happy' || mood === 'normal') {
      bucket = pool.progress.length > 0 && mood === 'happy' ? pool.progress : pool.idle;
    } else {
      bucket = pool.idle;
    }
    const raw = bucket[messageIndex % bucket.length];
    setCurrentMessage(stripEmoji(raw));
  }, [messageIndex, mood, timeOfDay, preferences.pebblePersonality, stripEmoji]);

  return (
    <PebbleContext.Provider
      value={{ mood, currentMessage, setMood, flashMood, deriveMoodFromCompletion }}
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
