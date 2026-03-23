'use client';

import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import ActivityFeed from '@/components/activity/ActivityFeed';
import { usePebble } from '@/contexts/PebbleContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';

export default function ActivityPage() {
  const { mood } = usePebble();
  const { entries } = useActivityLog();

  const totalDecisions = entries.length;
  const safetyPassed = entries.filter((e) => e.safetyStatus === 'passed').length;
  const uniqueAgents = new Set(entries.map((e) => e.agent)).size;

  const stats = [
    { label: 'today', value: String(totalDecisions), color: 'var(--accent-lavender)', title: 'Decisions made' },
    { label: 'all passed', value: String(safetyPassed), color: 'var(--accent-sage)', title: 'Safety checks' },
    { label: 'in pipeline', value: String(uniqueAgents), color: 'var(--accent-amber)', title: 'Agents active' },
  ];

  return (
    <>
      <ScreenBackground scene="rooftop" />
      <div className="relative z-[1] p-10 px-12">
        {/* Header with Pebble */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>activity log</h1>
            <p className="screen-subtitle">A log of everything Pebble has been thinking about.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PebbleSpeechBubble message="Here's what I've been thinking about" />
            <PebbleCharacter mood={mood} size="small" />
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap' }}>
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="glass-card"
              style={{ padding: 16, minWidth: 140, flex: '1 1 140px', maxWidth: 200 }}
            >
              <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {stat.title}
              </div>
              <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 24, color: stat.color, lineHeight: 1, marginBottom: 4 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Activity feed (includes filter bar) */}
        <ActivityFeed entries={entries} />

        {/* Empty state */}
        {entries.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <PebbleCharacter mood="sleepy" size="small" />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12 }}>
              Nothing here yet. Start using the app and I&apos;ll track my decisions here.
            </p>
          </div>
        )}

        {/* Bottom note */}
        <div style={{ marginTop: 32, fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 600 }}>
          In production, this feed maps to Microsoft Foundry Control Plane tracing with built-in evaluators for coherence, groundedness, and safety.
        </div>
      </div>
    </>
  );
}
