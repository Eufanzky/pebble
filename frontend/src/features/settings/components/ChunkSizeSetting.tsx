'use client';

import { usePreferences } from '@/shared/preferences';
import { chunkSizes } from '../data/options';
import { usePreferenceActions } from '../hooks/usePreferenceActions';

export default function ChunkSizeSetting() {
  const { preferences } = usePreferences();
  const { setChunkSize } = usePreferenceActions();

  return (
    <div className="ui-card" style={{ padding: '18px 20px' }}>
      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 10 }}>
        Task chunk size
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {chunkSizes.map((cs) => {
          const active = preferences.chunkSize === cs.id;
          return (
            <button
              key={cs.id}
              onClick={() => setChunkSize(cs.id)}
              aria-pressed={active}
              style={{
                padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 600,
                border: active ? '1px solid var(--color-accent)' : '1px solid var(--color-line)',
                background: active ? 'rgba(196,181,212,0.2)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-2)',
                transition: 'all 0.15s ease',
              }}
            >
              {cs.label}
            </button>
          );
        })}
      </div>
      <div style={{ fontSize: 11, color: 'var(--color-text-3)', marginTop: 10 }}>
        Affects how Pebble breaks down tasks for you
      </div>
    </div>
  );
}
