import type { ActivityStat } from '../lib/stats';

export default function ActivityStats({ stats }: { stats: ActivityStat[] }) {
  return (
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
  );
}
