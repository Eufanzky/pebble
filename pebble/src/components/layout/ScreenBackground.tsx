import { memo } from 'react';

type Scene = 'cafe' | 'library' | 'rooftop' | 'bedroom';

const scenes: Record<Scene, string> = {
  cafe: '/backgrounds/cafe.jpg',
  library: '/backgrounds/library.png',
  rooftop: '/backgrounds/rooftop.webp',
  bedroom: '/backgrounds/bedroom.jpg',
};

export default memo(function ScreenBackground({ scene }: { scene: Scene }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: 'var(--bg-deep)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={scenes[scene]}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[var(--bg-deep)] opacity-30" />
    </div>
  );
});
