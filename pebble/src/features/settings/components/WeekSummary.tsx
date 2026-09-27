/** "This week" numbers. They are fixed sample numbers for now (A-020). */
export default function WeekSummary() {
  return (
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
  );
}
