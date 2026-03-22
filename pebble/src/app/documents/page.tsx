'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePebble } from '@/contexts/PebbleContext';

export default function DocumentsPage() {
  const { mood } = usePebble();

  return (
    <>
      <ScreenBackground scene="library" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Documents</h1>
          <p className="screen-subtitle">Your readings, simplified and organized.</p>
        </div>

        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
        >
          Document cards, reading level slider, and simplification modal coming soon.
        </div>

        <div className="flex justify-end mt-6 mr-4">
          <div className="flex flex-col items-center gap-3">
            <PebbleSpeechBubble message="Drop a doc, I'll help you understand it" />
            <PebbleCharacter mood={mood} size="small" />
          </div>
        </div>
      </div>
    </>
  );
}
