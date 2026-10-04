'use client';

import { useState } from 'react';
import { LANGUAGES } from '../lib/translation';
import ToolButton from './ToolButton';

interface LanguageMenuProps {
  selected: string;
  onSelect: (language: string) => void;
  calm: boolean;
  noMotion: boolean;
}

export default function LanguageMenu({ selected, onSelect, calm, noMotion }: LanguageMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <ToolButton
        active={selected !== 'English'}
        noMotion={noMotion}
        onClick={() => setOpen(!open)}
        ariaExpanded={open}
      >
        {calm ? 'Translate' : '🌐 Translate'}
      </ToolButton>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,248,235,0.1)',
          borderRadius: 10, padding: '6px 0', zIndex: 2, minWidth: 160,
        }}>
          {LANGUAGES.map((l) => (
            <button
              key={l.name}
              onClick={() => { onSelect(l.name); setOpen(false); }}
              aria-pressed={selected === l.name}
              style={{
                display: 'flex', width: '100%', padding: '8px 14px', border: 'none', gap: 8,
                background: selected === l.name ? 'rgba(196,181,212,0.1)' : 'transparent',
                color: selected === l.name ? 'var(--color-accent)' : 'var(--color-text-2)',
                fontSize: 12, fontFamily: 'var(--font-nunito)', cursor: 'pointer', textAlign: 'left',
                alignItems: 'center',
              }}
            >
              {!calm && <span aria-hidden="true">{l.flag}</span>}
              <span>{l.name}</span>
              {selected === l.name && <span aria-hidden="true" style={{ marginLeft: 'auto', fontSize: 10 }}>{calm ? 'Active' : '✓'}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
