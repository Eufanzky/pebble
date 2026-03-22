'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import { usePreferences } from '@/contexts/PreferencesContext';
import type { PebbleModel } from '@/lib/types';

const models: { id: PebbleModel; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'The original Pebble' },
  { id: 'chonky', name: 'Chonky Bean', desc: 'Pusheen-inspired, breathing body' },
  { id: 'mochi', name: 'Mochi Ball', desc: 'Ultra-round blob, big eyes' },
  { id: 'minimal', name: 'Sleek', desc: 'Tamagotchi-like, minimal' },
  { id: 'chonky-plus', name: 'Chonky+', desc: 'Stripes, double-blink, purrs on hover' },
  { id: 'mochi-plus', name: 'Mochi+', desc: 'Jelly wobble, nuzzles on hover' },
  { id: 'minimal-plus', name: 'Sleek+', desc: 'Pixel-bob, eyes widen on hover' },
];

export default function SettingsPage() {
  const { preferences, setPreferences } = usePreferences();

  const selectModel = (id: PebbleModel) => {
    setPreferences((prev) => ({ ...prev, pebbleModel: id }));
  };

  return (
    <>
      <ScreenBackground scene="bedroom" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Settings</h1>
          <p className="screen-subtitle">Make pebble yours.</p>
        </div>

        {/* Model picker */}
        <div className="mb-8">
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 16 }}>
            Choose your Pebble
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
            {models.map((m) => {
              const active = preferences.pebbleModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => selectModel(m.id)}
                  className="glass-card"
                  style={{
                    padding: '20px 12px 14px',
                    cursor: 'pointer',
                    border: active ? '2px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                    background: active ? 'rgba(196,181,212,0.1)' : 'var(--glass-bg)',
                    textAlign: 'center',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', height: 100, alignItems: 'flex-end', marginBottom: 10 }}>
                    <PebbleCharacter mood="normal" size="small" model={m.id} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 13, color: active ? 'var(--text-primary)' : 'var(--text-secondary)', marginBottom: 2 }}>
                    {m.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {m.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
        >
          Color picker, personality, and accessibility preferences coming soon.
        </div>
      </div>
    </>
  );
}
