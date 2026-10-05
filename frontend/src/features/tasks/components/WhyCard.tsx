'use client';

import { useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { PebbleFace } from '@/features/companion';

interface WhyCardProps {
  explanation: string;
}

export default function WhyCard({ explanation }: WhyCardProps) {
  const [expanded, setExpanded] = useState(false);
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;

  const toggle = () => setExpanded(!expanded);

  return (
    <div style={{ marginTop: 10 }}>
      <button
        onClick={toggle}
        className="why-toggle"
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          fontFamily: 'var(--font-nunito)', fontSize: 12, color: 'var(--color-accent)',
          display: 'flex', alignItems: 'center', gap: 4,
          transition: noMotion ? 'none' : 'opacity 0.15s ease',
          opacity: 0.8,
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
      >
        <span aria-hidden="true" style={{ fontSize: 13 }}>?</span>
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
          borderLeft: '2px solid var(--color-accent)',
          borderRadius: '0 10px 10px 0',
          display: 'flex',
          gap: 10,
          alignItems: 'flex-start',
        }}>
          <PebbleFace />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, color: 'var(--color-text-3)', marginBottom: 4,
            }}>
              Pebble explains:
            </div>
            <div style={{
              fontFamily: 'var(--font-nunito)', fontSize: 13,
              color: 'var(--color-text-2)', lineHeight: 1.6,
            }}>
              {explanation}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
