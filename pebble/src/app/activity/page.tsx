'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePebble } from '@/contexts/PebbleContext';

export default function ActivityPage() {
  const { mood } = usePebble();

  return (
    <>
      <ScreenBackground scene="rooftop" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Activity</h1>
          <p className="screen-subtitle">A log of everything Pebble has helped you with.</p>
        </div>

        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
        >
          Activity feed and audit trail coming soon.
        </div>

        <div className="flex justify-end mt-6 mr-4">
          <div className="flex flex-col items-center gap-3">
            <PebbleSpeechBubble message="Here's what I've been thinking about" />
            <PebbleCharacter mood={mood} size="small" />
          </div>
        </div>
      </div>
    </>
  );
}
