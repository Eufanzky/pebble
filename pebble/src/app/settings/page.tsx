'use client';

import { useState } from 'react';
import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePreferences } from '@/contexts/PreferencesContext';
import { usePebble } from '@/contexts/PebbleContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useToast } from '@/contexts/ToastContext';
import { PEBBLE_COLORS } from '@/lib/constants';
import type { PebbleModel, PebbleColor, PebblePersonality, ChunkSize } from '@/lib/types';

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

const personalities: { id: PebblePersonality; name: string; desc: string; quote: string }[] = [
  { id: 'gentle', name: 'Gentle & encouraging', desc: 'Soft, warm, patient', quote: "No rush, we'll get through this together" },
  { id: 'playful', name: 'Playful & funny', desc: 'Light jokes, cat puns, energetic', quote: 'Paw-sitively doable!' },
  { id: 'calm', name: 'Calm & minimal', desc: 'Brief, no-pressure, minimal', quote: 'Ready when you are.' },
];

const chunkSizes: { id: ChunkSize; label: string; desc: string }[] = [
  { id: 'small', label: 'Small (5-10 min)', desc: 'Short focus bursts' },
  { id: 'medium', label: 'Medium (15-20 min)', desc: 'Balanced' },
  { id: 'large', label: 'Large (30+ min)', desc: 'Deep work sessions' },
];

const connectedApps = [
  { name: 'Microsoft Teams', desc: 'Import messages and meeting notes', emoji: '\uD83D\uDCAC', defaultOn: true },
  { name: 'Outlook Calendar', desc: 'Sync deadlines and events as tasks', emoji: '\uD83D\uDCE7', defaultOn: true },
  { name: 'Moodle LMS', desc: 'Import assignments and course materials', emoji: '\uD83C\uDF93', defaultOn: false },
  { name: 'Slack', desc: 'Import messages and reminders', emoji: '\uD83D\uDCAD', defaultOn: false },
  { name: 'Google Calendar', desc: 'Sync events and deadlines', emoji: '\uD83D\uDCC5', defaultOn: false },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <h2 style={{ fontFamily: 'var(--font-baloo)', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700 }}>{title}</h2>
      {subtitle && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{subtitle}</p>}
    </div>
  );
}

function ToggleSwitch({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? 'var(--accent-lavender)' : 'rgba(255,248,235,0.12)',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: on ? 'white' : 'var(--text-muted)',
        position: 'absolute', top: 3, left: on ? 23 : 3,
        transition: 'left 0.2s ease, background 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}

export default function SettingsPage() {
  const { preferences, setPreferences } = usePreferences();
  const { mood } = usePebble();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const [voiceBanner, setVoiceBanner] = useState(false);
  const [appStates, setAppStates] = useState<Record<string, boolean>>(() => {
    const s: Record<string, boolean> = {};
    connectedApps.forEach((app) => { s[app.name] = app.defaultOn; });
    return s;
  });

  const calm = preferences.calmMode;

  const selectModel = (id: PebbleModel) => {
    setPreferences((prev) => ({ ...prev, pebbleModel: id }));
  };

  const selectColor = (id: PebbleColor) => {
    setPreferences((prev) => ({ ...prev, pebbleColor: id }));
    showToast(`Pebble is now ${id}!`);
    addEntry('AdaptLens', `Pebble color changed to ${id}`, `User selected ${id} from color picker.`);
  };

  const selectPersonality = (id: PebblePersonality) => {
    setPreferences((prev) => ({ ...prev, pebblePersonality: id }));
    addEntry('AdaptLens', `Personality mode changed to ${id}`, `User selected ${id} personality from settings.`);
  };

  const handleReadingLevel = (level: number) => {
    setPreferences((prev) => ({ ...prev, readingLevel: level }));
    addEntry('AdaptLens', `Default reading level changed to ${level}`, `User adjusted reading level slider to ${level}.`);
  };

  const handleChunkSize = (size: ChunkSize) => {
    setPreferences((prev) => ({ ...prev, chunkSize: size }));
    addEntry('AdaptLens', `Chunk size changed to ${size}`, `User selected ${size} chunk size.`);
  };

  const toggleReduceAnimations = () => {
    const next = !preferences.reduceAnimations;
    setPreferences((prev) => ({ ...prev, reduceAnimations: next }));
    addEntry('AdaptLens', `Reduce animations ${next ? 'enabled' : 'disabled'}`, `User toggled reduce animations to ${next}.`);
  };

  const toggleCalmMode = () => {
    const next = !preferences.calmMode;
    setPreferences((prev) => ({ ...prev, calmMode: next }));
    addEntry('AdaptLens', `Calm mode ${next ? 'enabled' : 'disabled'}`, `User toggled calm mode to ${next}.`);
  };

  const toggleVoiceInput = () => {
    const next = !preferences.voiceInput;
    setPreferences((prev) => ({ ...prev, voiceInput: next }));
    if (next) setVoiceBanner(true);
    else setVoiceBanner(false);
  };

  const toggleApp = (name: string) => {
    const next = !appStates[name];
    setAppStates((prev) => ({ ...prev, [name]: next }));
    showToast(`${name} ${next ? 'connected' : 'disconnected'}!`);
    addEntry('BridgeBot', `${name} ${next ? 'connected' : 'disconnected'}`, `User toggled ${name} integration.`);
  };

  const handleOverride = () => {
    showToast('Preference restored');
  };

  const handleReset = () => {
    if (!window.confirm('This will reset all settings to default. Your tasks and documents will be kept. Continue?')) return;
    const keysToRemove = ['pebble-preferences', 'pebble-activity'];
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    showToast('Preferences reset to defaults');
    window.location.reload();
  };

  const personalityMessage = (() => {
    switch (preferences.pebblePersonality) {
      case 'gentle': return 'Make this space yours';
      case 'playful': return 'Let\'s make this purr-fect!';
      case 'calm': return 'Your settings.';
    }
  })();

  return (
    <>
      <ScreenBackground scene="bedroom" />
      <div className="relative z-[1] p-10 px-12 pb-20">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>settings</h1>
            <p className="screen-subtitle">Make pebble yours.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PebbleSpeechBubble message={personalityMessage} />
            <PebbleCharacter mood={mood} size="medium" />
          </div>
        </div>

        {/* ===== SECTION: Pebble ===== */}
        <SectionHeader title="Pebble" subtitle="Customize your companion" />

        {/* Model picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Choose your Pebble
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
            {models.map((m) => {
              const active = preferences.pebbleModel === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => selectModel(m.id)}
                  className="glass-card"
                  style={{
                    padding: '14px 8px 10px', cursor: 'pointer', textAlign: 'center',
                    border: active ? '2px solid var(--accent-lavender)' : '1px solid var(--glass-border)',
                    background: active ? 'rgba(196,181,212,0.1)' : 'var(--glass-bg)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'center', height: 70, alignItems: 'flex-end', marginBottom: 6 }}>
                    <PebbleCharacter mood="normal" size="small" model={m.id} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 12, color: active ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{m.name}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{m.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Color picker */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Pebble&apos;s color
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

        {/* Personality picker */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Pebble&apos;s personality
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
            {personalities.map((p) => {
              const active = preferences.pebblePersonality === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => selectPersonality(p.id)}
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

        {/* ===== SECTION: Accessibility ===== */}
        <SectionHeader title="Accessibility preferences" subtitle="These settings are applied across the entire app" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
          {/* Reading level */}
          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <label htmlFor="settings-reading-level" style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Default reading level</label>
              <span style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 12, color: 'var(--accent-lavender)' }}>Level {preferences.readingLevel}</span>
            </div>
            <input
              id="settings-reading-level"
              type="range" min={1} max={10} value={preferences.readingLevel}
              onChange={(e) => handleReadingLevel(Number(e.target.value))}
              aria-valuemin={1}
              aria-valuemax={10}
              aria-valuenow={preferences.readingLevel}
              aria-valuetext={`Reading level ${preferences.readingLevel} of 10`}
              style={{
                width: '100%', height: 4, appearance: 'none', WebkitAppearance: 'none',
                background: `linear-gradient(to right, var(--accent-lavender) ${(preferences.readingLevel - 1) * 11.1}%, var(--border-soft) ${(preferences.readingLevel - 1) * 11.1}%)`,
                borderRadius: 2, outline: 'none', cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Simple</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clear</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Detailed</span>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center' }}>
              {Array.from({ length: 10 }, (_, i) => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i < preferences.readingLevel ? 'var(--accent-lavender)' : 'var(--border-soft)',
                  transition: 'background 0.15s ease',
                }} />
              ))}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              This sets the starting level when Pebble simplifies documents for you
            </div>
          </div>

          {/* Chunk size */}
          <div className="glass-card" style={{ padding: '18px 20px' }}>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>
              Task chunk size
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {chunkSizes.map((cs) => {
                const active = preferences.chunkSize === cs.id;
                return (
                  <button
                    key={cs.id}
                    onClick={() => handleChunkSize(cs.id)}
                    style={{
                      padding: '7px 16px', borderRadius: 20, cursor: 'pointer',
                      fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 600,
                      border: active ? '1px solid var(--accent-lavender)' : '1px solid var(--border-soft)',
                      background: active ? 'rgba(196,181,212,0.2)' : 'transparent',
                      color: active ? 'var(--accent-lavender)' : 'var(--text-secondary)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cs.label}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10 }}>
              Affects how Pebble breaks down tasks for you
            </div>
          </div>

          {/* Toggles */}
          <div className="glass-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Reduce animations */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Reduce animations</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Disables all motion, transitions, and animated effects</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>Supports WCAG 2.2 criterion 2.3.3</div>
              </div>
              <ToggleSwitch on={preferences.reduceAnimations} onChange={toggleReduceAnimations} label="Reduce animations" />
            </div>

            <div style={{ borderTop: '1px solid var(--border-soft)' }} />

            {/* Calm mode */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Calm mode</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Removes emoji and decorative symbols from all text</div>
              </div>
              <ToggleSwitch on={preferences.calmMode} onChange={toggleCalmMode} label="Calm mode" />
            </div>

            <div style={{ borderTop: '1px solid var(--border-soft)' }} />

            {/* Voice input */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Voice input</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Enable microphone for voice commands</div>
                </div>
                <ToggleSwitch on={preferences.voiceInput} onChange={toggleVoiceInput} label="Voice input" />
              </div>
              {voiceBanner && preferences.voiceInput && (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, padding: '8px 12px', background: 'rgba(255,248,235,0.04)', borderRadius: 8 }}>
                  Voice input coming soon — powered by Azure AI Speech SDK
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== SECTION: Pebble has adapted ===== */}
        <SectionHeader title="Pebble has adapted" subtitle="Based on your activity, Pebble adjusted these settings" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
          {/* Adaptation 1 */}
          <div className="glass-card" style={{ padding: '14px 18px' }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(196,181,212,0.15)', color: 'var(--accent-lavender)', marginBottom: 8 }}>
              Adapted for you
            </span>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              Chunk size &rarr; Small (5-10 min)
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
              You completed 4 out of 4 small tasks yesterday but abandoned 2 medium tasks. Pebble suggested smaller chunks.
            </div>
            <button onClick={handleOverride} style={{
              padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid var(--border-soft)', background: 'transparent',
              color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600,
            }}>
              Override
            </button>
          </div>

          {/* Adaptation 2 */}
          <div className="glass-card" style={{ padding: '14px 18px' }}>
            <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 6, background: 'rgba(196,181,212,0.15)', color: 'var(--accent-lavender)', marginBottom: 8 }}>
              Adapted for you
            </span>
            <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
              Reading level &rarr; 4
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>
              You moved the reading slider down from 5 to 3 twice last session. Pebble lowered your default by 1 level.
            </div>
            <button onClick={handleOverride} style={{
              padding: '5px 14px', borderRadius: 8, cursor: 'pointer',
              border: '1px solid var(--border-soft)', background: 'transparent',
              color: 'var(--text-muted)', fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600,
            }}>
              Override
            </button>
          </div>
        </div>

        {/* ===== SECTION: Connected apps ===== */}
        <SectionHeader title="Connected apps" subtitle="Pebble can pull tasks and documents from your tools" />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 12 }}>
          {connectedApps.map((app) => {
            const on = appStates[app.name];
            return (
              <div
                key={app.name}
                className="glass-card"
                style={{
                  padding: 14, borderRadius: 12,
                  borderLeft: on ? '3px solid var(--accent-sage)' : '3px solid transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{calm ? '' : app.emoji}</span>
                    <span style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{app.name}</span>
                  </div>
                  <ToggleSwitch on={on} onChange={() => toggleApp(app.name)} label={`Connect ${app.name}`} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{app.desc}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: on ? 'var(--accent-sage)' : 'var(--text-muted)' }}>
                  {on ? 'Connected' : 'Not connected'}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 32 }}>
          Powered by BridgeBot agent via Azure API Management
        </div>

        {/* ===== SECTION: This week ===== */}
        <SectionHeader title="This week" />

        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Tasks completed */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 16, minWidth: 160, textAlign: 'center', flex: '1 1 160px', maxWidth: 220 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><polyline points="3,8 6.5,11.5 13,4.5" stroke="var(--accent-sage)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 28, color: 'var(--text-primary)' }}>12</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>tasks completed</div>
          </div>

          {/* Focus time */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 16, minWidth: 160, textAlign: 'center', flex: '1 1 160px', maxWidth: 220 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-lavender)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="var(--accent-lavender)" strokeWidth="1.5" /><line x1="8" y1="4" x2="8" y2="8" stroke="var(--accent-lavender)" strokeWidth="1.5" strokeLinecap="round" /><line x1="8" y1="8" x2="11" y2="10" stroke="var(--accent-lavender)" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 28, color: 'var(--text-primary)' }}>3h 20m</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>focus time</div>
          </div>

          {/* Documents simplified */}
          <div className="glass-card" style={{ padding: 20, borderRadius: 16, minWidth: 160, textAlign: 'center', flex: '1 1 160px', maxWidth: 220 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid var(--accent-amber)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
              <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><rect x="1" y="1" width="12" height="14" rx="2" stroke="var(--accent-amber)" strokeWidth="1.5" /><line x1="4" y1="5" x2="10" y2="5" stroke="var(--accent-amber)" strokeWidth="1.2" strokeLinecap="round" /><line x1="4" y1="8" x2="10" y2="8" stroke="var(--accent-amber)" strokeWidth="1.2" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 28, color: 'var(--text-primary)' }}>4</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>documents simplified</div>
          </div>
        </div>

        {/* Pebble encouragement */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          <PebbleSpeechBubble message="You're doing amazing. Seriously." />
          <PebbleCharacter mood={mood} size="small" />
        </div>

        {/* Reset link */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleReset}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--text-muted)',
              textDecoration: 'underline', textUnderlineOffset: '3px',
            }}
          >
            Reset all preferences
          </button>
        </div>
      </div>
    </>
  );
}
