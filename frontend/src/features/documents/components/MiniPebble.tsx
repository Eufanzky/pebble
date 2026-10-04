/** A small Pebble face next to Pebble's notes. */
export default function MiniPebble({ size = 24 }: { size?: number }) {
  const eye = size / 6;
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: '50%', background: 'var(--pebble-color)', position: 'relative', flexShrink: 0 }}
    >
      <div style={{ position: 'absolute', width: eye, height: eye, background: '#2A2A2E', borderRadius: '50%', top: size * 0.37, left: size / 4 }} />
      <div style={{ position: 'absolute', width: eye, height: eye, background: '#2A2A2E', borderRadius: '50%', top: size * 0.37, right: size / 4 }} />
    </div>
  );
}
