export type ViewMode = 'list' | 'roadmap';

const LABELS: Record<ViewMode, string> = { list: 'List', roadmap: 'Roadmap' };

interface ViewToggleProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  noMotion: boolean;
}

export default function ViewToggle({ value, onChange, noMotion }: ViewToggleProps) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-surface)', borderRadius: 10, padding: 3 }}>
      {(['list', 'roadmap'] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => onChange(mode)}
          aria-pressed={value === mode}
          style={{
            padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--font-nunito)', fontSize: 12, fontWeight: 600,
            background: value === mode ? 'rgba(196,181,212,0.2)' : 'transparent',
            color: value === mode ? 'var(--accent-lavender)' : 'var(--text-muted)',
            transition: noMotion ? 'none' : 'all 0.15s ease',
            textTransform: 'capitalize',
          }}
        >
          {LABELS[mode]}
        </button>
      ))}
    </div>
  );
}
