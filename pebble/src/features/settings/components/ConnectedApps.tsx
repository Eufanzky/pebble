'use client';

import { usePreferences } from '@/shared/preferences';
import { connectedApps } from '../data/options';
import { useConnectedApps } from '../hooks/useConnectedApps';
import ToggleSwitch from './ToggleSwitch';

export default function ConnectedApps() {
  const { preferences } = usePreferences();
  const { connected, syncing, toggle } = useConnectedApps();

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginBottom: 12 }}>
        {connectedApps.map((app) => {
          const on = connected[app.name];
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
                  <span aria-hidden="true" style={{ fontSize: 18 }}>{preferences.calmMode ? '' : app.emoji}</span>
                  <span style={{ fontFamily: 'var(--font-nunito)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{app.name}</span>
                </div>
                <ToggleSwitch on={on} onChange={() => toggle(app.name)} label={`Connect ${app.name}`} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>{app.desc}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: syncing === app.name ? 'var(--accent-amber)' : on ? 'var(--accent-sage)' : 'var(--text-muted)' }}>
                {syncing === app.name ? 'Syncing...' : on ? 'Connected' : 'Not connected'}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 32 }}>
        Powered by BridgeBot agent via Azure API Management
      </div>
    </>
  );
}
