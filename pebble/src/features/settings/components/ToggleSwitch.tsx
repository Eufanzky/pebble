export default function ToggleSwitch({ on, onChange, label }: { on: boolean; onChange: () => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onChange}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? 'var(--color-accent)' : 'rgba(255,248,235,0.12)',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%',
        background: on ? 'white' : 'var(--color-text-3)',
        position: 'absolute', top: 3, left: on ? 23 : 3,
        transition: 'left 0.2s ease, background 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </button>
  );
}
