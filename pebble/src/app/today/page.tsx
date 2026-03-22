'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePebble } from '@/contexts/PebbleContext';

export default function TodayPage() {
  const { mood, currentMessage } = usePebble();

  return (
    <>
      <ScreenBackground scene="cafe" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Today</h1>
          <p className="screen-subtitle">Your tasks for today, one step at a time.</p>
        </div>

        <div className="flex gap-10">
          {/* Left: placeholder task area */}
          <div className="flex-1">
            <div
              className="glass-card p-8 text-center"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
            >
              Task list, progress bar, and focus panel coming soon.
            </div>
          </div>

          {/* Right: Pebble companion */}
          <div className="flex flex-col items-center gap-4 min-w-[200px]">
            <PebbleSpeechBubble message={currentMessage} />
            <PebbleCharacter mood={mood} size="large" />
            <div
              style={{
                fontFamily: 'var(--font-nunito)',
                fontSize: 11,
                color: 'var(--text-muted)',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              Pebble
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
