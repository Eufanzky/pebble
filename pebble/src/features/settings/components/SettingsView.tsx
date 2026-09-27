'use client';

import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { usePreferences } from '@/shared/preferences';
import { useResetPreferences } from '../hooks/useResetPreferences';
import { settingsGreeting } from '../lib/greeting';
import AdaptationCards from './AdaptationCards';
import ChunkSizeSetting from './ChunkSizeSetting';
import ConnectedApps from './ConnectedApps';
import DisplayToggles from './DisplayToggles';
import PebblePickers from './PebblePickers';
import ReadingLevelSetting from './ReadingLevelSetting';
import SectionHeader from './SectionHeader';
import WeekSummary from './WeekSummary';

/** The settings screen: Pebble, accessibility, integrations, and a reset. */
export default function SettingsView() {
  const { preferences } = usePreferences();
  const { mood } = usePebble();
  const reset = useResetPreferences();

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>settings</h1>
          <p className="screen-subtitle">Make pebble yours.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PebbleSpeechBubble message={settingsGreeting(preferences.pebblePersonality)} />
          <PebbleCharacter mood={mood} size="medium" />
        </div>
      </div>

      <SectionHeader title="Pebble" subtitle="Customize your companion" />
      <PebblePickers />

      <SectionHeader title="Accessibility preferences" subtitle="These settings are applied across the entire app" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
        <ReadingLevelSetting />
        <ChunkSizeSetting />
        <DisplayToggles />
      </div>

      <SectionHeader title="Pebble has adapted" subtitle="Based on your activity, Pebble adjusted these settings" />
      <AdaptationCards />

      <SectionHeader title="Connected apps" subtitle="Pebble can pull tasks and documents from your tools" />
      <ConnectedApps />

      <SectionHeader title="This week" />
      <WeekSummary />

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 32 }}>
        <PebbleSpeechBubble message="You're doing amazing. Seriously." />
        <PebbleCharacter mood={mood} size="small" />
      </div>

      <div style={{ textAlign: 'center' }}>
        <button
          onClick={reset}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-muted)',
            textDecoration: 'underline', textUnderlineOffset: '3px',
          }}
        >
          Reset all preferences
        </button>
      </div>
    </>
  );
}
