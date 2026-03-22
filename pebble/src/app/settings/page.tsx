'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePreferences } from '@/contexts/PreferencesContext';
import { usePebble } from '@/contexts/PebbleContext';
import { PEBBLE_COLORS } from '@/lib/constants';
import type { PebbleModel, PebbleColor } from '@/lib/types';

const models: { id: PebbleModel; name: string; desc: string }[] = [
  { id: 'classic', name: 'Classic', desc: 'The original Pebble' },
  { id: 'chonky', name: 'Chonky Bean', desc: 'Pusheen-inspired' },
  { id: 'mochi', name: 'Mochi Ball', desc: 'Ultra-round blob' },
  { id: 'minimal', name: 'Sleek', desc: 'Tamagotchi-like' },
  { id: 'chonky-plus', name: 'Chonky+', desc: 'Stripes, purrs on hover' },
  { id: 'mochi-plus', name: 'Mochi+', desc: 'Jelly wobble, nuzzle hover' },
  { id: 'minimal-plus', name: 'Sleek+', desc: 'Pixel-bob, eye widen' },
];

const colorOptions: { id: PebbleColor; label: string }[] = [
  { id: 'lavender', label: 'Lavender' },
  { id: 'sage', label: 'Sage' },
  { id: 'coral', label: 'Coral' },
  { id: 'amber', label: 'Amber' },
  { id: 'sky', label: 'Sky' },
];

export default function SettingsPage() {
  const { preferences, setPreferences } = usePreferences();
  const { mood } = usePebble();

  const selectModel = (id: PebbleModel) => {
    setPreferences((prev) => ({ ...prev, pebbleModel: id }));
  };

  const selectColor = (id: PebbleColor) => {
    setPreferences((prev) => ({ ...prev, pebbleColor: id }));
  };

  const toggleReduceAnimations = () => {
    setPreferences((prev) => ({ ...prev, reduceAnimations: !prev.reduceAnimations }));
  };

  const toggleCalmMode = () => {
    setPreferences((prev) => ({ ...prev, calmMode: !prev.calmMode }));
  };

  return (
    <>
      <ScreenBackground scene="bedroom" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Settings</h1>
          <p className="screen-subtitle">Make pebble yours.</p>
        </div>

        <div className="flex gap-10">
          <div className="flex-1">
            {/* Model picker */}
            <div className="mb-8">
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 14 }}>
                Choose your Pebble
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
                {models.map((m) => {
                  const active = preferences.pebbleModel === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => selectModel(m.id)}
                      className="glass-card"
                      style={{
                        padding: '16px 10px 12px',
                        cursor: 'pointer',
                        border: active ? '2px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                        background: active ? 'rgba(196,181,212,0.1)' : 'var(--glass-bg)',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'center', height: 80, alignItems: 'flex-end', marginBottom: 8 }}>
                        <PebbleCharacter mood="normal" size="small" model={m.id} />
                      </div>
                      <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 12, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {m.name}
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        {m.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Color picker */}
            <div className="mb-8">
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 14 }}>
                Pebble color
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {colorOptions.map((c) => {
                  const active = preferences.pebbleColor === c.id;
                  const hex = PEBBLE_COLORS[c.id].hex;
                  return (
                    <button
                      key={c.id}
                      onClick={() => selectColor(c.id)}
                      title={c.label}
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: hex,
                        border: active ? '3px solid var(--text-primary)' : '2px solid rgba(255,255,255,0.1)',
                        cursor: 'pointer',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                        transform: active ? 'scale(1.1)' : 'scale(1)',
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Accessibility toggles */}
            <div className="glass-card p-5 mb-4">
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 14 }}>
                Accessibility
              </div>

              {/* Reduce animations */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-primary)' }}>Reduce animations</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Disables all motion and transitions</div>
                </div>
                <button
                  onClick={toggleReduceAnimations}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    background: preferences.reduceAnimations ? 'var(--accent-lavender)' : 'rgba(255,248,235,0.12)',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: 3,
                    left: preferences.reduceAnimations ? 23 : 3,
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>

              {/* Calm mode */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, color: 'var(--text-primary)' }}>Calm mode</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Removes emoji from all text</div>
                </div>
                <button
                  onClick={toggleCalmMode}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: 'none',
                    cursor: 'pointer',
                    background: preferences.calmMode ? 'var(--accent-lavender)' : 'rgba(255,248,235,0.12)',
                    position: 'relative',
                    transition: 'background 0.2s ease',
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'white',
                    position: 'absolute',
                    top: 3,
                    left: preferences.calmMode ? 23 : 3,
                    transition: 'left 0.2s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </button>
              </div>
            </div>
          </div>

          {/* Right: Pebble preview */}
          <div className="flex flex-col items-center gap-4 min-w-[180px] pt-8">
            <PebbleSpeechBubble message="Make this space yours" />
            <PebbleCharacter mood={mood} size="medium" />
          </div>
        </div>
      </div>
    </>
  );
}
