'use client';

import { usePreferences } from '@/shared/preferences';
import { usePreferenceActions } from '../hooks/usePreferenceActions';

const scaleLabel = { fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 } as const;

export default function ReadingLevelSetting() {
  const { preferences } = usePreferences();
  const { setReadingLevel } = usePreferenceActions();
  const level = preferences.readingLevel;
  const fill = (level - 1) * 11.1;

  return (
    <div className="glass-card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <label htmlFor="settings-reading-level" style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Default reading level</label>
        <span aria-hidden="true" style={{ fontVariantNumeric: 'tabular-nums', fontSize: 12, color: 'var(--accent-lavender)' }}>Level {level}</span>
      </div>
      <input
        id="settings-reading-level"
        type="range" min={1} max={10} value={level}
        onChange={(e) => setReadingLevel(Number(e.target.value))}
        aria-valuetext={`Reading level ${level} of 10`}
        style={{
          width: '100%', height: 4, appearance: 'none', WebkitAppearance: 'none',
          background: `linear-gradient(to right, var(--accent-lavender) ${fill}%, var(--border-soft) ${fill}%)`,
          borderRadius: 2, outline: 'none', cursor: 'pointer',
        }}
      />
      <div aria-hidden="true" style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
        <span style={scaleLabel}>Simple</span>
        <span style={scaleLabel}>Clear</span>
        <span style={scaleLabel}>Detailed</span>
      </div>
      <div aria-hidden="true" style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < level ? 'var(--accent-lavender)' : 'var(--border-soft)',
            transition: 'background 0.15s ease',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
        This sets the starting level when Pebble simplifies documents for you
      </div>
    </div>
  );
}
