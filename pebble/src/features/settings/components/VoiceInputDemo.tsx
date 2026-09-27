'use client';

import { usePreferences } from '@/shared/preferences';
import { useVoiceInputDemo } from '../hooks/useVoiceInputDemo';

/** The mic button shown once voice input is on. */
export default function VoiceInputDemo() {
  const { reduceMotion } = usePreferences();
  const { listening, listen } = useVoiceInputDemo();
  const color = listening ? 'var(--accent-coral)' : 'var(--accent-lavender)';

  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={listen}
        disabled={listening}
        aria-label={listening ? 'Listening...' : 'Start voice input'}
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: listening ? 'default' : 'pointer',
          background: listening ? 'rgba(232,133,106,0.2)' : 'rgba(196,181,212,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: listening && !reduceMotion ? 'voicePulse 1.2s ease-in-out infinite' : 'none',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <rect x="7" y="2" width="4" height="9" rx="2" fill={color} />
          <path d="M4 9a5 5 0 0 0 10 0" stroke={color} strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <line x1="9" y1="14" x2="9" y2="16.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div style={{ fontSize: 12, color: listening ? 'var(--accent-coral)' : 'var(--text-muted)' }}>
        {listening ? 'Listening... speak now' : 'Tap the mic to try voice input'}
      </div>
      <style>{`@keyframes voicePulse { 0%,100% { box-shadow: 0 0 0 0 rgba(232,133,106,0.3); } 50% { box-shadow: 0 0 0 10px rgba(232,133,106,0); } }`}</style>
    </div>
  );
}
