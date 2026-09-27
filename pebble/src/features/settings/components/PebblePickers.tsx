'use client';

import { PebbleCharacter } from '@/features/companion';
import { PEBBLE_COLORS, usePreferences } from '@/shared/preferences';
import { colorOptions, models, personalities } from '../data/options';
import { usePreferenceActions } from '../hooks/usePreferenceActions';

const label = { fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 } as const;

/** Pebble's model, color and personality. */
export default function PebblePickers() {
  const { preferences } = usePreferences();
  const { selectModel, selectColor, selectPersonality } = usePreferenceActions();

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <div style={label}>Choose your Pebble</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
          {models.map((m) => {
            const active = preferences.pebbleModel === m.id;
            return (
              <button
                key={m.id}
                onClick={() => selectModel(m.id)}
                aria-pressed={active}
                className="glass-card"
                style={{
                  padding: '14px 8px 10px', cursor: 'pointer', textAlign: 'center',
                  border: active ? '2px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                  background: active ? 'rgba(196,181,212,0.1)' : 'var(--glass-bg)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', height: 95, alignItems: 'flex-end', marginBottom: 6, overflow: 'visible' }}>
                  <PebbleCharacter mood="normal" size="small" model={m.id} />
                </div>
                <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 12, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{m.name}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{m.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={label}>Pebble&apos;s color</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {colorOptions.map((c) => {
            const active = preferences.pebbleColor === c.id;
            const hex = PEBBLE_COLORS[c.id].hex;
            return (
              <button
                key={c.id}
                onClick={() => selectColor(c.id)}
                title={c.label}
                aria-label={c.label}
                aria-pressed={active}
                style={{
                  width: 32, height: 32, borderRadius: '50%', background: hex,
                  border: active ? '3px solid rgba(255,255,255,0.6)' : '2px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: active ? `0 0 12px ${hex}` : 'none',
                }}
              />
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: 32 }}>
        <div style={label}>Pebble&apos;s personality</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
          {personalities.map((p) => {
            const active = preferences.pebblePersonality === p.id;
            return (
              <button
                key={p.id}
                onClick={() => selectPersonality(p.id)}
                aria-pressed={active}
                className="glass-card"
                style={{
                  padding: 16, textAlign: 'left', cursor: 'pointer',
                  border: active ? '1px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                  background: active ? 'rgba(196,181,212,0.1)' : 'var(--glass-bg)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 4 }}>
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{p.desc}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>&ldquo;{p.quote}&rdquo;</div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
