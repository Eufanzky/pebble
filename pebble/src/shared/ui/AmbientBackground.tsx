'use client';

import { memo } from 'react';
import { usePreferences } from '@/shared/preferences';

/** One feeling per screen; the colours come from Pebble's colour and the tag tokens. */
type AmbientMood = 'today' | 'documents' | 'activity' | 'focus' | 'settings' | 'welcome';

/**
 * The screen's background: two or three large, blurred fields of colour that
 * drift very slowly behind the content (roadmap 5.2, replacing the photos).
 * Decorative only. Still with reduce animations (or the OS setting) and in calm mode.
 */
export const AmbientBackground = memo(function AmbientBackground({ mood }: { mood: AmbientMood }) {
  const { reduceMotion, preferences } = usePreferences();
  const still = reduceMotion || preferences.calmMode;

  return (
    <div className="ambient" data-mood={mood} data-still={still || undefined} aria-hidden="true">
      <div className="ambient__field ambient__field--a" />
      <div className="ambient__field ambient__field--b" />
      <div className="ambient__field ambient__field--c" />
      <div className="ambient__veil" />
    </div>
  );
});
