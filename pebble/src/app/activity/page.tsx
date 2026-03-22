import ScreenBackground from '@/components/layout/ScreenBackground';

export default function ActivityPage() {
  return (
    <>
      <ScreenBackground scene="rooftop" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Activity</h1>
          <p className="screen-subtitle">A log of everything Pebble has helped you with.</p>
        </div>

        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
        >
          Activity feed and audit trail coming soon.
        </div>
      </div>
    </>
  );
}
