'use client';

import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { useActivityLog } from '../context/ActivityLogContext';
import { activityStats } from '../lib/stats';
import ActivityFeed from './ActivityFeed';
import ActivityStats from './ActivityStats';

/** The activity screen: every agent decision, with its reasoning and safety status. */
export default function ActivityView() {
  const { mood } = usePebble();
  const { entries } = useActivityLog();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>activity log</h1>
          <p className="screen-subtitle">A log of everything Pebble has been thinking about.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PebbleSpeechBubble message="Here's what I've been thinking about" />
          <PebbleCharacter mood={mood} size="small" />
        </div>
      </div>

      <ActivityStats stats={activityStats(entries)} />

      <ActivityFeed entries={entries} />

      {entries.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <PebbleCharacter mood="sleepy" size="small" />
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
            Nothing here yet. Start using the app and I&apos;ll track my decisions here.
          </p>
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
        This log stays in your browser. Each entry names the agent, what it did, why, and whether the safety check passed.
      </div>
    </>
  );
}
