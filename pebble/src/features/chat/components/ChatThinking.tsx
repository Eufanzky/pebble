/** Shown while Pebble waits for a reply. */
export default function ChatThinking() {
  return (
    <div style={{
      alignSelf: 'flex-start', padding: '10px 14px',
      background: 'var(--color-surface-2)', borderRadius: 14, borderBottomLeftRadius: 4,
      display: 'flex', alignItems: 'center', gap: 6,
    }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%',
        background: 'var(--pebble-color)', position: 'relative',
      }}>
        <div style={{ position: 'absolute', width: 3, height: 3, background: '#2A2A2E', borderRadius: '50%', top: 7, left: 4 }} />
        <div style={{ position: 'absolute', width: 3, height: 3, background: '#2A2A2E', borderRadius: '50%', top: 7, right: 4 }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--color-text-3)', fontStyle: 'italic' }}>
        Pebble is thinking...
      </span>
    </div>
  );
}
