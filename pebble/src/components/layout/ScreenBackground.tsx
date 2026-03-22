'use client';

type Scene = 'cafe' | 'library' | 'rooftop' | 'bedroom';

function CafeBackground() {
  return (
    <div className="scene-bg">
      {/* Base warm dark brown */}
      <div className="scene-base" style={{ background: '#1a1410' }} />

      {/* Window shape with moonlight */}
      <div
        className="scene-layer"
        style={{
          top: '6%',
          left: '10%',
          width: 'min(420px, 45%)',
          height: '50%',
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(80, 100, 140, 0.08) 0%, rgba(60, 80, 110, 0.03) 100%)',
          border: '1px solid rgba(255, 248, 235, 0.04)',
        }}
      />
      {/* Moonlight glow through window */}
      <div
        className="scene-layer"
        style={{
          top: '8%',
          left: '18%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(180, 200, 230, 0.06) 0%, transparent 70%)',
        }}
      />

      {/* Desk surface */}
      <div
        className="scene-layer"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: '12%',
          background: 'linear-gradient(to top, #2A1F15, #3D2B1F 40%, transparent)',
        }}
      />

      {/* Plant silhouette */}
      <div className="scene-layer" style={{ bottom: '11%', right: '20%' }}>
        {/* Stem */}
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 3, height: 40, background: 'rgba(60, 90, 60, 0.3)',
        }} />
        {/* Leaf 1 */}
        <div style={{
          position: 'absolute', bottom: 25, left: '50%',
          width: 0, height: 0,
          borderLeft: '12px solid transparent',
          borderRight: '12px solid transparent',
          borderBottom: '28px solid rgba(60, 100, 60, 0.2)',
          transform: 'translateX(-50%) rotate(-8deg)',
        }} />
        {/* Leaf 2 */}
        <div style={{
          position: 'absolute', bottom: 35, left: '50%',
          width: 0, height: 0,
          borderLeft: '10px solid transparent',
          borderRight: '10px solid transparent',
          borderBottom: '22px solid rgba(50, 90, 50, 0.18)',
          transform: 'translateX(-30%) rotate(12deg)',
        }} />
      </div>

      {/* Amber lamp glow */}
      <div
        className="scene-layer"
        style={{
          top: '15%',
          right: '25%',
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 168, 67, 0.1) 0%, rgba(212, 168, 67, 0.03) 40%, transparent 70%)',
        }}
      />
      {/* Warm ambient overlay */}
      <div
        className="scene-layer"
        style={{
          inset: 0,
          background: 'radial-gradient(ellipse 500px 400px at 70% 20%, rgba(212, 168, 67, 0.08) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

function LibraryBackground() {
  const bookColors = [
    { color: 'var(--accent-lavender)', h: 65 },
    { color: 'var(--accent-sage)', h: 50 },
    { color: 'var(--accent-amber)', h: 72 },
    { color: 'var(--accent-coral)', h: 55 },
    { color: 'var(--accent-lavender)', h: 80 },
    { color: 'var(--accent-sage)', h: 60 },
    { color: 'var(--accent-amber)', h: 45 },
  ];

  return (
    <div className="scene-bg">
      {/* Base dark wood */}
      <div className="scene-base" style={{ background: '#16120e' }} />

      {/* Left bookshelf */}
      <div className="scene-layer" style={{ top: 0, left: 0, bottom: 0, width: 70, display: 'flex', gap: 3, padding: '8px 8px', alignItems: 'flex-end' }}>
        {bookColors.map((book, i) => (
          <div key={`l-${i}`} style={{
            width: 6, height: `${book.h}%`,
            background: book.color, opacity: 0.12,
            borderRadius: '2px 2px 0 0',
          }} />
        ))}
      </div>

      {/* Right bookshelf */}
      <div className="scene-layer" style={{ top: 0, right: 0, bottom: 0, width: 55, display: 'flex', gap: 3, padding: '8px 8px', alignItems: 'flex-end' }}>
        {[...bookColors].reverse().map((book, i) => (
          <div key={`r-${i}`} style={{
            width: 5, height: `${book.h + 10}%`,
            background: book.color, opacity: 0.1,
            borderRadius: '2px 2px 0 0',
          }} />
        ))}
      </div>

      {/* Reading lamp glow */}
      <div
        className="scene-layer"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(245, 237, 214, 0.06) 0%, rgba(212, 168, 67, 0.03) 40%, transparent 70%)',
        }}
      />

      {/* Wooden table surface */}
      <div
        className="scene-layer"
        style={{
          bottom: 0,
          left: 0,
          right: 0,
          height: '10%',
          background: 'linear-gradient(to top, #1A1208 0%, #2A1F10 50%, transparent)',
        }}
      />
    </div>
  );
}

function RooftopBackground() {
  const lights = Array.from({ length: 9 }, (_, i) => ({
    x: 8 + i * 10,
    y: 5 + Math.sin(i * 0.7) * 2,
  }));

  return (
    <div className="scene-bg">
      {/* Deep blue-purple sky gradient */}
      <div className="scene-base" style={{
        background: 'linear-gradient(180deg, #0a0a1a 0%, #12102a 40%, #1a1028 100%)',
      }} />

      {/* String lights */}
      <svg
        className="scene-layer"
        style={{ inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {/* Wire path */}
        <path
          d={`M ${lights.map((l) => `${l.x},${l.y}`).join(' L ')}`}
          fill="none"
          stroke="rgba(212, 168, 67, 0.08)"
          strokeWidth="0.15"
        />
        {/* Light bulbs */}
        {lights.map((l, i) => (
          <circle
            key={i}
            cx={l.x} cy={l.y + 0.8}
            r="0.5"
            fill="var(--accent-amber)"
            opacity={0.15 + (i % 3) * 0.05}
          />
        ))}
      </svg>

      {/* Ambient glow from string lights */}
      <div
        className="scene-layer"
        style={{
          top: 0, left: '5%', right: '5%', height: '20%',
          background: 'radial-gradient(ellipse 80% 100% at 50% 0%, rgba(212, 168, 67, 0.04) 0%, transparent 70%)',
        }}
      />

      {/* Left leaf silhouette */}
      <div className="scene-layer" style={{ bottom: 0, left: 0 }}>
        <div style={{
          width: 0, height: 0,
          borderLeft: '80px solid rgba(20, 50, 20, 0.25)',
          borderTop: '120px solid transparent',
        }} />
      </div>
      <div className="scene-layer" style={{ bottom: 0, left: 30 }}>
        <div style={{
          width: 0, height: 0,
          borderLeft: '50px solid rgba(25, 60, 25, 0.18)',
          borderTop: '90px solid transparent',
        }} />
      </div>

      {/* Right leaf silhouette */}
      <div className="scene-layer" style={{ bottom: 0, right: 0 }}>
        <div style={{
          width: 0, height: 0,
          borderRight: '60px solid rgba(20, 50, 20, 0.2)',
          borderTop: '100px solid transparent',
        }} />
      </div>
    </div>
  );
}

function BedroomBackground() {
  return (
    <div className="scene-bg">
      {/* Base mauve-brown */}
      <div className="scene-base" style={{
        background: 'linear-gradient(180deg, #141018 0%, #16121a 100%)',
      }} />

      {/* Window with cool moonlight */}
      <div
        className="scene-layer"
        style={{
          top: '10%',
          right: '15%',
          width: '140px',
          height: '180px',
          borderRadius: 8,
          background: 'rgba(120, 140, 180, 0.04)',
          border: '1px solid rgba(120, 140, 180, 0.06)',
        }}
      />
      {/* Moonlight glow */}
      <div
        className="scene-layer"
        style={{
          top: '8%',
          right: '12%',
          width: '200px',
          height: '220px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(150, 170, 210, 0.05) 0%, transparent 60%)',
        }}
      />

      {/* Shelf 1 */}
      <div
        className="scene-layer"
        style={{
          top: '25%',
          left: '8%',
          width: '120px',
          height: '4px',
          borderRadius: 2,
          background: 'rgba(255, 248, 235, 0.04)',
        }}
      />
      {/* Shelf 2 */}
      <div
        className="scene-layer"
        style={{
          top: '40%',
          left: '5%',
          width: '90px',
          height: '4px',
          borderRadius: 2,
          background: 'rgba(255, 248, 235, 0.03)',
        }}
      />

      {/* Warm ambient from lower area */}
      <div
        className="scene-layer"
        style={{
          inset: 0,
          background: 'radial-gradient(ellipse 500px 350px at 30% 75%, rgba(180, 140, 120, 0.03) 0%, transparent 60%)',
        }}
      />
    </div>
  );
}

export default function ScreenBackground({ scene }: { scene: Scene }) {
  switch (scene) {
    case 'cafe': return <CafeBackground />;
    case 'library': return <LibraryBackground />;
    case 'rooftop': return <RooftopBackground />;
    case 'bedroom': return <BedroomBackground />;
  }
}
