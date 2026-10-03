'use client';

import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import type { ReactNode } from 'react';
import { usePreferences } from '@/shared/preferences';
import { Button, Screen, ScreenHeader } from '@/shared/ui';
import { useResetPreferences } from '../hooks/useResetPreferences';
import { settingsGreeting } from '../lib/greeting';
import ChunkSizeSetting from './ChunkSizeSetting';
import DisplayToggles from './DisplayToggles';
import PebblePickers from './PebblePickers';
import ReadingLevelSetting from './ReadingLevelSetting';
import SectionHeader from './SectionHeader';

/** The settings screen: Pebble, accessibility, a reset, and (from the page) the account. */
export default function SettingsView({ account }: { account?: ReactNode }) {
  const { preferences } = usePreferences();
  const { mood } = usePebble();
  const reset = useResetPreferences();

  return (
    <Screen width="narrow">
      <ScreenHeader
        title="Settings"
        lead="Make Pebble yours."
        companion={
          <>
            <PebbleSpeechBubble
              className="ui-screen-header__bubble"
              message={settingsGreeting(preferences.pebblePersonality)}
            />
            <PebbleCharacter mood={mood} size="small" />
          </>
        }
      />

      <SectionHeader title="Pebble" subtitle="Customize your companion" />
      <PebblePickers />

      <SectionHeader title="Accessibility preferences" subtitle="These settings are applied across the entire app" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
        <ReadingLevelSetting />
        <ChunkSizeSetting />
        <DisplayToggles />
      </div>

      <div>
        <Button variant="ghost" onClick={reset}>
          Reset all preferences
        </Button>
      </div>

      {account}
    </Screen>
  );
}
