export default function Loading() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      color: 'var(--color-text-3)',
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
