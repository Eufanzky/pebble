import ScreenBackground from '@/components/layout/ScreenBackground';

export default function SettingsPage() {
  return (
    <>
      <ScreenBackground scene="bedroom" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Settings</h1>
          <p className="screen-subtitle">Make pebble yours.</p>
        </div>

        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
        >
          Pebble customization, accessibility preferences, and connected apps coming soon.
        </div>
      </div>
    </>
  );
}
