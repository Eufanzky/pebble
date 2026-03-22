'use client';

import { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';

interface WhyCardProps {
  explanation: string;
  onOpen?: () => void;
}

function MiniPebbleFace() {
  return (
    <div style={{
      width: 24, height: 24, borderRadius: '50%',
      background: 'var(--pebble-color)', position: 'relative',
      flexShrink: 0,
    }}>
      {/* Eyes */}
      <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 9, left: 6 }}>
        <div style={{ position: 'absolute', width: 1.5, height: 1.5, background: 'white', borderRadius: '50%', top: 0.5, right: 0.5 }} />
      </div>
      <div style={{ position: 'absolute', width: 4, height: 4, background: '#2A2A2E', borderRadius: '50%', top: 9, right: 6 }}>
        <div style={{ position: 'absolute', width: 1.5, height: 1.5, background: 'white', borderRadius: '50%', top: 0.5, right: 0.5 }} />
      </div>
      {/* Nose */}
      <div style={{
        position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
        width: 0, height: 0,
        borderLeft: '1.5px solid transparent', borderRight: '1.5px solid transparent',
        borderTop: '2px solid #E8A0BF',
      }} />
    </div>
  );
}

export default function WhyCard({ explanation, onOpen }: WhyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;

  const toggle = () => {
    if (!expanded && onOpen) onOpen();
    setExpanded(!expanded);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={toggle}
        className="why-toggle"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--accent-lavender)',
          display: 'flex', alignItems: 'center', gap: 4,
          transition: noMotion ? 'none' : 'opacity 0.15s ease',
          opacity: 0.8,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
      >
        <span style={{ fontSize: 13 }}>?</span>
        {expanded ? 'Hide explanation' : 'Why did Pebble do this?'}
      </button>

      <div
        className="why-card-wrapper"
        style={{
          maxHeight: expanded ? 300 : 0,
          overflow: 'hidden',
          transition: noMotion ? 'none' : 'max-height 0.3s ease-out',
        }}
      >
        <div style={{
          marginTop: 8,
          padding: '12px 14px',
          background: 'rgba(255, 248, 235, 0.04)',
          borderLeft: '2px solid var(--accent-lavender)',
          borderRadius: '0 10px 10px 0',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <MiniPebbleFace />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 4,
            }}>
              Pebble explains:
            </div>
            <div style={{
              fontFamily: 'var(--font-nunito)', fontSize: 13,
              color: 'var(--text-secondary)', lineHeight: 1.6,
            }}>
              {explanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
