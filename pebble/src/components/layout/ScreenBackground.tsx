import Image from 'next/image';

type Scene = 'cafe' | 'library' | 'rooftop' | 'bedroom';

const scenes: Record<Scene, string> = {
  cafe: '/backgrounds/cafe.jpg',
  library: '/backgrounds/library.png',
  rooftop: '/backgrounds/rooftop.webp',
  bedroom: '/backgrounds/bedroom.jpg',
};

export default function ScreenBackground({ scene }: { scene: Scene }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ backgroundColor: 'var(--bg-deep)' }}>
      <Image
        src={scenes[scene]}
        alt=""
        fill
        priority
        className="object-cover opacity-40"
        sizes="(min-width: 260px) calc(100vw - 260px), 100vw"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[var(--bg-deep)] opacity-30" />
    </div>
  );
}
