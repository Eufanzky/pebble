import MiniPebble from './MiniPebble';

/** Pebble's note on which reading level is shown, and why. */
export default function LevelNote({ text, compact }: { text: string; compact: boolean }) {
  return (
    <div style={{
      display: 'flex', gap: compact ? 8 : 10, alignItems: 'flex-start',
      marginTop: compact ? 20 : 0, marginBottom: compact ? 0 : 20,
      padding: compact ? '10px 12px' : '10px 14px', background: 'rgba(255,248,235,0.04)',
      borderLeft: '2px solid var(--accent-lavender)', borderRadius: compact ? '0 8px 8px 0' : '0 10px 10px 0',
    }}>
      <MiniPebble size={compact ? 18 : 22} />
      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: compact ? 11 : 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}
