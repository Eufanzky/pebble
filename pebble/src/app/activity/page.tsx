'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { usePebble } from '@/contexts/PebbleContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';

export default function ActivityPage() {
  const { mood } = usePebble();
  const { entries } = useActivityLog();

  return (
    <>
      <ScreenBackground scene="rooftop" />
      <div className="relative z-[1] p-10 px-12">
        {/* Header with Pebble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>activity</h1>
            <p className="screen-subtitle">A log of everything Pebble has been thinking about.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PebbleSpeechBubble message="Here's what I've been thinking about" />
            <PebbleCharacter mood={mood} size="small" />
          </div>
        </div>

        {/* Activity feed */}
        <ActivityFeed entries={entries} />
      </div>
    </>
  );
}
