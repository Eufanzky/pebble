import type { Greeting } from '../lib/today';

export default function TodayGreeting({ greeting, date }: { greeting: Greeting; date: string }) {
  return (
    <div
      className="glass-card"
      style={{ padding: '18px 24px', marginBottom: 24, opacity: greeting.muted ? 0.8 : 1 }}
    >
      <div style={{
        fontFamily: 'var(--font-baloo)',
        fontSize: 20,
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: 2,
      }}>
        {greeting.text}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
        {date}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {greeting.sub}
      </div>
    </div>
  );
}
