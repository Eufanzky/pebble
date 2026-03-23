import type { PebbleMood } from '@/lib/types';

/* ========== Mood Particles (excited burst) ========== */
const PARTICLE_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export function MoodParticles() {
  return (
    <div className="pb-particles">
      {PARTICLE_ANGLES.map((angle, i) => (
        <span
          key={angle}
          className="pb-particle"
          style={{ '--angle': `${angle}deg`, '--delay': `${i * 0.1}s` } as React.CSSProperties}
        >
          &#9670;
        </span>
      ))}
    </div>
  );
}

/* ========== Sparkles (legacy wrapper, now uses particles) ========== */
export function Sparkles() {
  return <MoodParticles />;
}

/* ========== Zzz (3 staggered z letters) ========== */
export function Zzz() {
  return (
    <div className="pb-zzz-group">
      <span className="pb-zzz-letter pb-zzz-1">z</span>
      <span className="pb-zzz-letter pb-zzz-2">z</span>
      <span className="pb-zzz-letter pb-zzz-3">z</span>
    </div>
  );
}

/* ========== Eye (mood-aware: star eyes for excited, flat for sleepy) ========== */
export function Eye({ side, mood, size = 12, top = 34, offset = 26, shine = 4, secondShine = false }: {
  side: 'l' | 'r'; mood: PebbleMood; size?: number; top?: number; offset?: number; shine?: number; secondShine?: boolean;
}) {
  const pos = side === 'l' ? { left: offset } : { right: offset };

  // Excited: star eyes
  if (mood === 'excited') {
    const starSize = size * 1.2;
    return (
      <div
        className={`pb-eye pb-star-eye ${side === 'l' ? 'eye-l' : 'eye-r'}`}
        style={{
          position: 'absolute', width: starSize, height: starSize,
          top: top - (starSize - size) / 2, zIndex: 5, ...pos,
        }}
      >
        <div style={{
          width: '100%', height: '100%',
          background: 'var(--accent-amber)',
          clipPath: 'polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%)',
        }} />
      </div>
    );
  }

  // Happy: slightly larger eyes
  const scale = mood === 'happy' ? 1.15 : 1;
  const eyeSize = size * scale;

  return (
    <div
      className={`pb-eye ${side === 'l' ? 'eye-l' : 'eye-r'} ${mood === 'sleepy' ? 'sleepy' : ''}`}
      style={{
        position: 'absolute', width: eyeSize, height: eyeSize,
        background: '#2A2A2E', borderRadius: '50%',
        top: top - (eyeSize - size) / 2, zIndex: 5, ...pos,
      }}
    >
      <div className="pb-shine" style={{
        position: 'absolute', width: shine, height: shine,
        background: 'white', borderRadius: '50%', top: 2, right: 2,
      }} />
      {secondShine && (
        <div style={{
          position: 'absolute', width: Math.max(2, shine - 2), height: Math.max(2, shine - 2),
          background: 'rgba(255,255,255,0.5)', borderRadius: '50%', bottom: 3, left: 3,
        }} />
      )}
    </div>
  );
}

/* ========== Triangle Ear ========== */
export function TriangleEar({ side, top = -2, offset = 10, w = 14, h = 26, className = '' }: {
  side: 'l' | 'r'; top?: number; offset?: number; w?: number; h?: number; className?: string;
}) {
  const pos = side === 'l' ? { left: offset } : { right: offset };
  return (
    <div className={`${side === 'l' ? 'pb-ear-l' : 'pb-ear-r'} ${className}`} style={{
      position: 'absolute', top, ...pos, zIndex: 3, width: 0, height: 0,
      borderLeft: `${w}px solid transparent`, borderRight: `${w}px solid transparent`,
      borderBottom: `${h}px solid var(--pebble-color)`,
    }} />
  );
}

/* ========== Inner Ear ========== */
export function InnerEar({ side, top = 5, offset = 17, w = 7, h = 14 }: {
  side: 'l' | 'r'; top?: number; offset?: number; w?: number; h?: number;
}) {
  const pos = side === 'l' ? { left: offset } : { right: offset };
  return (
    <div style={{
      position: 'absolute', top, ...pos, zIndex: 4, width: 0, height: 0,
      borderLeft: `${w}px solid transparent`, borderRight: `${w}px solid transparent`,
      borderBottom: `${h}px solid rgba(232,160,191,0.45)`,
    }} />
  );
}

/* ========== Nose ========== */
export function Nose({ top = 53, style: extraStyle }: { top?: number; style?: 'triangle' | 'dot'; }) {
  if (extraStyle === 'dot') {
    return <div style={{ position: 'absolute', top, left: '50%', transform: 'translateX(-50%)', width: 5, height: 4, background: '#E8A0BF', borderRadius: '50% 50% 50% 50% / 30% 30% 70% 70%', zIndex: 5 }} />;
  }
  return (
    <div style={{
      position: 'absolute', top, left: '50%', transform: 'translateX(-50%)',
      width: 0, height: 0, zIndex: 5,
      borderLeft: '3.5px solid transparent', borderRight: '3.5px solid transparent',
      borderTop: '4px solid #E8A0BF',
    }} />
  );
}

/* ========== Mouth (mood-aware smile) ========== */
export function Mouth({ top = 57, mood }: { top?: number; mood?: PebbleMood }) {
  const width = mood === 'happy' || mood === 'excited' ? 18 : 14;
  const height = mood === 'happy' || mood === 'excited' ? 6 : 5;
  const half = width / 2;

  return (
    <div className="pb-mouth" style={{ position: 'absolute', top, left: '50%', transform: 'translateX(-50%)', width, height, zIndex: 5 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: half, height: height - 1, borderBottom: '1.5px solid rgba(42,42,46,0.3)', borderRadius: '0 0 0 50%' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: half, height: height - 1, borderBottom: '1.5px solid rgba(42,42,46,0.3)', borderRadius: '0 0 50% 0' }} />
    </div>
  );
}

/* ========== Blush (mood-aware, much more visible) ========== */
export function Blush({ top = 50, left, right, w = 12, h = 12, opacity }: {
  top?: number; left?: number; right?: number; w?: number; h?: number; opacity?: number;
}) {
  const pos = left !== undefined ? { left } : { right };
  return (
    <div className="pb-blush" style={{
      position: 'absolute', width: w, height: h,
      background: 'radial-gradient(circle, #F0A0C0 0%, transparent 70%)',
      borderRadius: '50%', top, zIndex: 5,
      opacity: opacity ?? 0, transition: 'opacity 0.4s ease',
      ...pos,
    }} />
  );
}

/* ========== Tail ========== */
export function Tail({ bottom = 16, right = -8, w = 50, h = 14 }: {
  bottom?: number; right?: number; w?: number; h?: number;
}) {
  return (
    <div className="pb-tail" style={{
      position: 'absolute', bottom, right, width: w, height: h,
      background: 'var(--pebble-color)', borderRadius: '0 50px 50px 0',
    }} />
  );
}

/* ========== Paw ========== */
export function Paw({ side, bottom = -2, offset = 22 }: { side: 'l' | 'r'; bottom?: number; offset?: number }) {
  const pos = side === 'l' ? { left: offset } : { right: offset };
  return (
    <div style={{
      position: 'absolute', bottom, width: 18, height: 10,
      background: 'var(--pebble-dark)', borderRadius: '50% 50% 40% 40%', zIndex: 3,
      ...pos,
    }} />
  );
}

/* ========== Whiskers ========== */
export function Whiskers({ top = 50 }: { top?: number }) {
  return (
    <>
      <div style={{ position: 'absolute', height: 1, width: 22, background: 'rgba(42,42,46,0.18)', zIndex: 5, top, left: 4, transform: 'rotate(-8deg)' }} />
      <div style={{ position: 'absolute', height: 1, width: 20, background: 'rgba(42,42,46,0.13)', zIndex: 5, top: top + 4, left: 2, transform: 'rotate(5deg)' }} />
      <div style={{ position: 'absolute', height: 1, width: 22, background: 'rgba(42,42,46,0.18)', zIndex: 5, top, right: 4, transform: 'rotate(8deg)' }} />
      <div style={{ position: 'absolute', height: 1, width: 20, background: 'rgba(42,42,46,0.13)', zIndex: 5, top: top + 4, right: 2, transform: 'rotate(-5deg)' }} />
    </>
  );
}
