'use client';

import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import type { ReactNode } from 'react';
import { usePreferences } from '@/shared/preferences';
import { Button, Screen, ScreenHeader } from '@/shared/ui';
import { useResetPreferences } from '../hooks/useResetPreferences';
import { settingsGreeting } from '../lib/greeting';
import StepSizeSetting from './StepSizeSetting';
import DisplayToggles from './DisplayToggles';
import PebblePickers from './PebblePickers';
import ReadingLevelSetting from './ReadingLevelSetting';
import ReminderSettings from './ReminderSettings';
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
        <StepSizeSetting />
        <DisplayToggles />
      </div>

      <SectionHeader title="Reminder" subtitle="Off unless you set one" />
      <div style={{ marginBottom: 32 }}>
        <ReminderSettings />
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
