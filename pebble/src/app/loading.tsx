export default function Loading() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-deep)',
      color: 'var(--text-muted)',
      fontFamily: 'var(--font-nunito)',
      fontSize: 14,
      gap: 12,
    }}>
      <div style={{
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'var(--pebble-color)',
        opacity: 0.6,
      }} />
      <span>zzz</span>
    </div>
  );
}
