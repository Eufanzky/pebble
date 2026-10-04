import { PebbleFace } from '@/features/companion';

/** Pebble's note on which reading level is shown, and why. */
export default function LevelNote({ text, compact }: { text: string; compact: boolean }) {
  return (
    <div style={{
      display: 'flex', gap: compact ? 8 : 10, alignItems: 'flex-start',
      marginTop: compact ? 20 : 0, marginBottom: compact ? 0 : 20,
      padding: compact ? '10px 12px' : '10px 14px', background: 'rgba(255,248,235,0.04)',
      borderLeft: '2px solid var(--color-accent)', borderRadius: compact ? '0 8px 8px 0' : '0 10px 10px 0',
    }}>
      <PebbleFace size={compact ? 18 : 22} />
      <div style={{ fontFamily: 'var(--font-nunito)', fontSize: compact ? 11 : 12, color: 'var(--color-text-2)', lineHeight: 1.5 }}>
        {text}
      </div>
    </div>
  );
}
