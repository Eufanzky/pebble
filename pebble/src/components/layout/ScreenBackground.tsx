import { memo } from 'react';

type Scene = 'cafe' | 'library' | 'rooftop' | 'bedroom' | 'study';

const scenes: Record<Scene, { src: string; overlay?: string }> = {
  cafe: { src: '/backgrounds/cafe.jpg' },
  library: { src: '/backgrounds/library.png' },
  rooftop: { src: '/backgrounds/rooftop.webp' },
  bedroom: { src: '/backgrounds/bedroom.jpg' },
  study: { src: '/backgrounds/rooftop.webp', overlay: 'rgba(20, 10, 30, 0.75)' },
};

export default memo(function ScreenBackground({ scene }: { scene: Scene }) {
  const { src, overlay } = scenes[scene];
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: 'var(--bg-deep)' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0" style={{ background: overlay ?? 'var(--bg-deep)', opacity: overlay ? 1 : 0.3 }} />
    </div>
  );
});
