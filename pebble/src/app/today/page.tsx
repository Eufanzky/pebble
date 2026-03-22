export default function TodayPage() {
  return (
    <div>
      <div className="mb-7">
        <h1 className="screen-title">Today</h1>
        <p className="screen-subtitle">Your tasks for today, one step at a time.</p>
      </div>

      <div
        className="glass-card p-8 text-center"
        style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
      >
        Task list, progress bar, and focus panel coming soon.
      </div>
    </div>
  );
}
