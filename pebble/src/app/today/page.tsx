'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePebble } from '@/contexts/PebbleContext';
import type { PebbleMood } from '@/lib/types';

const moods: PebbleMood[] = ['sleepy', 'normal', 'happy', 'excited'];

export default function TodayPage() {
  const { mood, currentMessage, setMood } = usePebble();

  return (
    <>
      <ScreenBackground scene="cafe" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Today</h1>
          <p className="screen-subtitle">Your tasks for today, one step at a time.</p>
        </div>

        <div className="flex gap-10">
          <div className="flex-1">
            <div
              className="glass-card p-8 text-center"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
            >
              Task list, progress bar, and focus panel coming soon.
            </div>

            {/* Mood test buttons — temporary */}
            <div className="glass-card p-4 mt-4" style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', textTransform: 'uppercase', letterSpacing: '1px', marginRight: 8 }}>
                Test mood:
              </span>
              {moods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 8,
                    border: mood === m ? '1.5px solid var(--accent-lavender)' : '1px solid var(--border-soft)',
                    background: mood === m ? 'rgba(196,181,212,0.15)' : 'transparent',
                    color: mood === m ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-nunito)',
                    fontSize: 11,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 min-w-[200px]">
            <PebbleSpeechBubble message={currentMessage} />
            <PebbleCharacter mood={mood} size="medium" />
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, color: 'var(--text-muted)', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: 4 }}>
              Pebble
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
