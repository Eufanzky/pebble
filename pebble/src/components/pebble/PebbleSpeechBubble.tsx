'use client';

import { useState, useEffect } from 'react';
import { usePebble } from '@/contexts/PebbleContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTasks } from '@/contexts/TasksContext';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { messages } from '@/data/pebbleMessages';

function stripEmoji(text: string): string {
  return text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();
}

export default function PebbleSpeechBubble() {
  const { mood } = usePebble();
  const { preferences } = usePreferences();
  const { tasks } = useTasks();
  const timeOfDay = useTimeOfDay();
  const [messageIndex, setMessageIndex] = useState(0);

  const done = tasks.filter((t) => t.completed).length;
  const total = tasks.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((i) => i + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const pool = (() => {
    const msgs = messages[preferences.personality];
    if (timeOfDay === 'night') return msgs.late;
    if (done === total && total > 0) return msgs.done;
    if (done > 0) return msgs.progress;
    return msgs.idle;
  })();

  const raw = pool[messageIndex % pool.length];
  const text = preferences.calmMode ? stripEmoji(raw) : raw;

  return (
    <div className="relative text-center max-w-[210px] mb-3.5">
      <div
        className="rounded-[14px] px-3.5 py-2.5 text-[12.5px] leading-relaxed"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-baloo)',
        }}
      >
        {text}
      </div>
      {/* Speech bubble arrow */}
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-0 h-0"
        style={{
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid var(--glass-bg)',
        }}
      />
    </div>
  );
}
