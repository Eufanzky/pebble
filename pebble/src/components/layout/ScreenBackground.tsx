import './ScreenBackground.css';

type Scene = 'cafe' | 'library' | 'rooftop' | 'bedroom';

function CafeScene() {
  return (
    <div className="scene-bg cafe">
      <div className="wall" />
      <div className="window">
        <div className="moonlight" />
        <div className="stars" style={{ top: '20%', left: '25%' }} />
        <div className="stars" style={{ top: '35%', left: '65%' }} />
        <div className="stars" style={{ top: '15%', left: '80%', width: 2, height: 2, opacity: 0.5 }} />
      </div>
      <div className="desk-surface" />
      <div className="desk" />
      <div className="plant">
        <div className="plant-leaf l1" />
        <div className="plant-leaf l2" />
        <div className="plant-leaf l3" />
        <div className="plant-stem" />
        <div className="plant-pot" />
      </div>
      <div className="lamp">
        <div className="lamp-glow" />
        <div className="lamp-shade" />
      </div>
      <div className="mug" style={{ bottom: 40, right: '32%' }}>
        <div className="mug-handle" />
        <div className="steam" />
        <div className="steam" style={{ left: 8, animationDelay: '0.7s' }} />
      </div>
    </div>
  );
}

function LibraryScene() {
  const leftBooks = [
    { w: 6, h: 32, bg: 'rgba(196,181,212,0.15)' },
    { w: 8, h: 40, bg: 'rgba(143,175,138,0.12)' },
    { w: 5, h: 28, bg: 'rgba(212,168,67,0.12)' },
    { w: 7, h: 36, bg: 'rgba(232,133,106,0.10)' },
    { w: 6, h: 44, bg: 'rgba(196,181,212,0.10)' },
    { w: 8, h: 30, bg: 'rgba(135,206,235,0.08)' },
    { w: 5, h: 38, bg: 'rgba(143,175,138,0.10)' },
  ];
  const rightBooks = [
    { w: 7, h: 38, bg: 'rgba(232,133,106,0.12)' },
    { w: 5, h: 30, bg: 'rgba(196,181,212,0.10)' },
    { w: 8, h: 42, bg: 'rgba(212,168,67,0.10)' },
    { w: 6, h: 34, bg: 'rgba(143,175,138,0.12)' },
    { w: 7, h: 26, bg: 'rgba(135,206,235,0.10)' },
    { w: 5, h: 40, bg: 'rgba(232,133,106,0.08)' },
  ];

  return (
    <div className="scene-bg library">
      <div className="shelf-left">
        {leftBooks.map((b, i) => (
          <div key={i} className="book" style={{ width: b.w, height: b.h, background: b.bg }} />
        ))}
        <div className="shelf-bar" style={{ bottom: 0 }} />
        <div className="shelf-bar" style={{ bottom: '50%' }} />
      </div>
      <div className="shelf-right">
        {rightBooks.map((b, i) => (
          <div key={i} className="book" style={{ width: b.w, height: b.h, background: b.bg }} />
        ))}
        <div className="shelf-bar" style={{ bottom: 0 }} />
        <div className="shelf-bar" style={{ bottom: '50%' }} />
      </div>
      <div className="lamp-glow" />
      <div className="table" />
      <div className="floor" />
    </div>
  );
}

function RooftopScene() {
  const lights = [
    { top: 52, left: '10%' },
    { top: 62, left: '22%' },
    { top: 55, left: '35%' },
    { top: 60, left: '48%' },
    { top: 72, left: '60%' },
    { top: 58, left: '72%' },
    { top: 54, left: '84%' },
    { top: 64, left: '93%' },
  ];
  const buildings = [
    { left: '5%', width: '8%', height: 30 },
    { left: '15%', width: '6%', height: 40 },
    { left: '25%', width: '10%', height: 25 },
    { left: '55%', width: '7%', height: 35 },
    { left: '68%', width: '12%', height: 28 },
    { left: '85%', width: '8%', height: 42 },
  ];
  const railPosts = ['8%', '28%', '48%', '68%', '88%'];
  const leaves = [
    { bottom: '8%', left: '3%', borderRight: '16px solid transparent', borderBottom: '24px solid rgba(45,74,42,0.15)' },
    { bottom: '12%', left: 0, borderRight: '12px solid transparent', borderBottom: '20px solid rgba(45,74,42,0.10)' },
    { bottom: '6%', right: '2%', borderLeft: '14px solid transparent', borderBottom: '22px solid rgba(45,74,42,0.12)' },
    { bottom: '10%', right: '5%', borderLeft: '10px solid transparent', borderBottom: '18px solid rgba(45,74,42,0.08)' },
  ];

  return (
    <div className="scene-bg rooftop">
      {/* String lights wire */}
      <svg
        viewBox="0 0 400 40"
        preserveAspectRatio="none"
        style={{ position: 'absolute', top: 40, left: '5%', right: '5%', width: '90%', height: 40 }}
      >
        <path
          d="M0,5 Q50,28 100,18 Q150,8 200,22 Q250,35 300,15 Q350,5 400,20"
          fill="none"
          stroke="rgba(245,237,214,0.06)"
          strokeWidth="1"
        />
      </svg>

      {/* Light bulbs */}
      {lights.map((l, i) => (
        <div key={i} className="light" style={{ top: l.top, left: l.left }} />
      ))}

      {/* City skyline */}
      <div className="city">
        {buildings.map((b, i) => (
          <div key={i} className="building" style={{ left: b.left, width: b.width, height: b.height }} />
        ))}
      </div>

      {/* Railing */}
      <div className="railing" />
      {railPosts.map((left, i) => (
        <div key={i} className="railing-post" style={{ left }} />
      ))}

      <div className="floor-glow" />

      {/* Leaf silhouettes */}
      {leaves.map((style, i) => (
        <div key={i} className="leaf" style={style as React.CSSProperties} />
      ))}
    </div>
  );
}

function BedroomScene() {
  return (
    <div className="scene-bg bedroom">
      <div className="wall" />
      <div className="window">
        <div className="moonlight" />
        <div className="curtain-l" />
        <div className="curtain-r" />
      </div>
      <div className="shelf s1">
        <div className="shelf-item" style={{ left: '10%', width: 12, height: 14 }} />
        <div className="shelf-item" style={{ left: '35%', width: 8, height: 10 }} />
        <div className="shelf-item" style={{ left: '60%', width: 14, height: 8, borderRadius: '50%' }} />
      </div>
      <div className="shelf s2">
        <div className="shelf-item" style={{ left: '15%', width: 10, height: 16 }} />
        <div className="shelf-item" style={{ left: '50%', width: 6, height: 12 }} />
      </div>
      <div className="floor" />
      <div className="rug" />
    </div>
  );
}

export default function ScreenBackground({ scene }: { scene: Scene }) {
  switch (scene) {
    case 'cafe': return <CafeScene />;
    case 'library': return <LibraryScene />;
    case 'rooftop': return <RooftopScene />;
    case 'bedroom': return <BedroomScene />;
  }
}
