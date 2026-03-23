import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, Mouth, Blush, Tail } from './SharedParts';

export default function MinimalModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      <div className="pb-blob" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 95, background: 'var(--pebble-color)', borderRadius: '50% 50% 45% 45%', boxShadow: '0 5px 16px rgba(0,0,0,0.2)' }}>
        <TriangleEar side="l" top={6} offset={10} w={10} h={18} />
        <TriangleEar side="r" top={6} offset={10} w={10} h={18} />
        <Eye side="l" mood={mood} size={8} top={42} offset={30} shine={3} />
        <Eye side="r" mood={mood} size={8} top={42} offset={30} shine={3} />
        <div style={{ position: 'absolute', top: 53, left: '50%', transform: 'translateX(-50%)', width: 4, height: 3, background: '#E8A0BF', borderRadius: '50%', zIndex: 5 }} />
        <Mouth top={57} mood={mood} />
        <Blush top={50} left={16} />
        <Blush top={50} right={16} />
      </div>
      <Tail bottom={18} right={-2} w={35} h={10} />
    </>
  );
}
