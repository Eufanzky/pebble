'use client';

import type { ReactNode } from 'react';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { Screen, ScreenHeader } from '@/shared/ui';
import { useActivityLog } from '../context/ActivityLogContext';
import { activitySummary } from '../lib/summary';
import ActivityFeed from './ActivityFeed';

/**
 * The activity screen: every agent decision, with its reasoning and safety status. `progress`: what
 * was finished since the start (8.2), from the stats feature.
 */
export default function ActivityView({ progress }: { progress?: ReactNode }) {
  const { mood } = usePebble();
  const { entries } = useActivityLog();
  const summary = activitySummary(entries);

  return (
    <Screen width="narrow">
      <ScreenHeader
        title="Activity"
        lead="What Pebble's agents did for you, and why."
        companion={
          <>
            <PebbleSpeechBubble className="ui-screen-header__bubble" message="Here's what I've been thinking about" />
            <PebbleCharacter mood={entries.length === 0 ? 'sleepy' : mood} size="small" />
          </>
        }
      />

      {summary && <p className="activity-summary">{summary}</p>}
      {progress}

      {entries.length > 0 ? (
        <ActivityFeed entries={entries} />
      ) : (
        <p className="activity-empty">Nothing here yet. Start using the app and I&apos;ll track my decisions here.</p>
      )}

      <p className="activity-note">
        This log is saved with your account. Each entry names the agent, what it did, why, and whether the safety
        check passed.
      </p>
    </Screen>
  );
}
