'use client';

import { usePathname } from 'next/navigation';

const backgrounds: Record<string, React.CSSProperties> = {
  '/today': {
    background: [
      'radial-gradient(ellipse 400px 350px at 85% 10%, rgba(212, 168, 67, 0.12) 0%, transparent 70%)',
      'radial-gradient(ellipse 500px 600px at 50% 20%, rgba(100, 120, 150, 0.06) 0%, transparent 60%)',
      'linear-gradient(to top, #2A1F15 0%, #3D2B1F 4%, transparent 18%)',
      '#1C1410',
    ].join(', '),
  },
  '/documents': {
    background: [
      'radial-gradient(ellipse 400px 400px at 50% 30%, rgba(245, 237, 214, 0.06) 0%, transparent 60%)',
      'linear-gradient(to top, #1A1208 0%, #2A1F10 3%, transparent 15%)',
      '#1A1208',
    ].join(', '),
  },
  '/activity': {
    background: [
      'radial-gradient(ellipse 400px 400px at 60% 40%, rgba(196, 181, 212, 0.06) 0%, transparent 60%)',
      'linear-gradient(180deg, #12101A 0%, #1A1520 100%)',
    ].join(', '),
  },
  '/settings': {
    background: [
      'radial-gradient(ellipse 300px 400px at 75% 25%, rgba(150, 170, 210, 0.07) 0%, transparent 60%)',
      'radial-gradient(ellipse 600px 400px at 30% 70%, rgba(180, 140, 120, 0.04) 0%, transparent 60%)',
      'linear-gradient(180deg, #1A1418 0%, #181215 100%)',
    ].join(', '),
  },
};

export default function ScreenBackground() {
  const pathname = usePathname();
  const route = pathname === '/' ? '/today' : pathname;
  const style = backgrounds[route] || backgrounds['/today'];

  return (
    <div
      className="fixed inset-0 -z-10"
      style={style}
    />
  );
}
