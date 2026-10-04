'use client';

import type { ReactNode } from 'react';
import { usePreferences } from '@/shared/preferences';
import { usePreferenceActions } from '../hooks/usePreferenceActions';
import ToggleSwitch from './ToggleSwitch';

function ToggleRow({ title, children, toggle }: { title: string; children: ReactNode; toggle: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{title}</div>
        {children}
      </div>
      {toggle}
    </div>
  );
}

const divider = <div style={{ borderTop: '1px solid var(--color-line)' }} />;
const hint = { fontSize: 12, color: 'var(--color-text-3)' } as const;

/** Reduce animations and calm mode. */
export default function DisplayToggles() {
  const { preferences } = usePreferences();
  const { toggleReduceAnimations, toggleCalmMode } = usePreferenceActions();

  return (
    <div className="ui-card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      <ToggleRow
        title="Reduce animations"
        toggle={<ToggleSwitch on={preferences.reduceAnimations} onChange={toggleReduceAnimations} label="Reduce animations" />}
      >
        <div style={hint}>Disables all motion, transitions, and animated effects</div>
        <div style={{ fontSize: 10, color: 'var(--color-text-3)', marginTop: 4 }}>Supports WCAG 2.2 criterion 2.3.3</div>
      </ToggleRow>

      {divider}

      <ToggleRow
        title="Calm mode"
        toggle={<ToggleSwitch on={preferences.calmMode} onChange={toggleCalmMode} label="Calm mode" />}
      >
        <div style={hint}>Removes emoji and decorative symbols from all text</div>
      </ToggleRow>

    </div>
  );
}
