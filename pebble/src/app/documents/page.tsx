import ScreenBackground from '@/components/layout/ScreenBackground';

export default function DocumentsPage() {
  return (
    <>
      <ScreenBackground scene="library" />
      <div className="relative z-[1] p-10 px-12">
        <div className="mb-7">
          <h1 className="screen-title">Documents</h1>
          <p className="screen-subtitle">Your readings, simplified and organized.</p>
        </div>

        <div
          className="glass-card p-8 text-center"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-baloo)' }}
        >
          Document cards, reading level slider, and simplification modal coming soon.
        </div>
      </div>
    </>
  );
}
