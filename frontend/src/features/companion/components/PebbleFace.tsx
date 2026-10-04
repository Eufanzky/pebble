/** Pebble's face alone, small: beside Pebble's notes, explanations and checks. Decorative. */
export default function PebbleFace({ size = 24 }: { size?: number }) {
  const unit = size / 24;
  const eye = 4 * unit;
  const shine = 1.5 * unit;
  return (
    <div
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: '50%', background: 'var(--pebble-color)', position: 'relative', flexShrink: 0 }}
    >
      {[{ left: 6 * unit }, { right: 6 * unit }].map((side, i) => (
        <div key={i} style={{ position: 'absolute', ...side, top: 9 * unit, width: eye, height: eye, background: '#2A2A2E', borderRadius: '50%' }}>
          <div style={{ position: 'absolute', width: shine, height: shine, background: 'white', borderRadius: '50%', top: 0.5 * unit, right: 0.5 * unit }} />
        </div>
      ))}
      <div
        style={{
          position: 'absolute', top: 14 * unit, left: '50%', transform: 'translateX(-50%)', width: 0, height: 0,
          borderLeft: `${1.5 * unit}px solid transparent`, borderRight: `${1.5 * unit}px solid transparent`,
          borderTop: `${2 * unit}px solid #E8A0BF`,
        }}
      />
    </div>
  );
}
