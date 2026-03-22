import type { PebbleMood } from '@/lib/types';

export function Sparkles() {
  return (
    <div className="pb-sparkles">
      <span className="pb-sparkle">&#10022;</span>
      <span className="pb-sparkle">&#10022;</span>
      <span className="pb-sparkle">&#10022;</span>
      <span className="pb-sparkle">&#10022;</span>
    </div>
  );
}

export function Zzz() {
  return <div className="pb-zzz">zzz</div>;
}

export function Eye({ side, mood, size = 12, top = 34, offset = 26, shine = 4, secondShine = false }: {
  side: 'l' | 'r'; mood: PebbleMood; size?: number; top?: number; offset?: number; shine?: number; secondShine?: boolean;
}) {
  const pos = side === 'l' ? { left: offset } : { right: offset };
  return (
    <div
      className={`pb-eye ${side === 'l' ? 'eye-l' : 'eye-r'} ${mood === 'sleepy' ? 'sleepy' : ''}`}
      style={{ position: 'absolute', width: size, height: size, background: '#2A2A2E', borderRadius: '50%', top, zIndex: 5, ...pos }}
    >
      <div className="pb-shine" style={{ position: 'absolute', width: shine, height: shine, background: 'white', borderRadius: '50%', top: 2, right: 2 }} />
      {secondShine && (
        <div style={{ position: 'absolute', width: Math.max(2, shine - 2), height: Math.max(2, shine - 2), background: 'rgba(255,255,255,0.5)', borderRadius: '50%', bottom: 3, left: 3 }} />
      )}
    </div>
  );
}

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

export function Mouth({ top = 57 }: { top?: number }) {
  return (
    <div style={{ position: 'absolute', top, left: '50%', transform: 'translateX(-50%)', width: 14, height: 5, zIndex: 5 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 7, height: 4, borderBottom: '1.5px solid rgba(42,42,46,0.25)', borderRadius: '0 0 0 50%' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, width: 7, height: 4, borderBottom: '1.5px solid rgba(42,42,46,0.25)', borderRadius: '0 0 50% 0' }} />
    </div>
  );
}

export function Blush({ top = 50, left, right, w = 16, h = 9, opacity }: {
  top?: number; left?: number; right?: number; w?: number; h?: number; opacity?: number;
}) {
  const pos = left !== undefined ? { left } : { right };
  return (
    <div className="pb-blush" style={{
      position: 'absolute', width: w, height: h,
      background: 'radial-gradient(ellipse, rgba(232,160,191,0.35) 0%, transparent 70%)',
      borderRadius: '50%', top, zIndex: 5,
      opacity: opacity ?? 0, transition: 'opacity 0.4s ease',
      ...pos,
    }} />
  );
}

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
