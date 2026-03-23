import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, InnerEar, Nose, Mouth, Blush, Tail } from './SharedParts';

export default function MochiPlusModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      <div className="pb-blob" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 122, height: 122, background: 'var(--pebble-color)', borderRadius: '50% 50% 46% 46%', boxShadow: '0 8px 24px rgba(0,0,0,0.2), inset 0 -15px 30px rgba(0,0,0,0.04)' }}>
        {/* Pear-shaped bottom */}
        <div style={{ position: 'absolute', bottom: -1, left: '50%', transform: 'translateX(-50%)', width: 128, height: 42, background: 'var(--pebble-color)', borderRadius: '50%', zIndex: -1 }} />
        <TriangleEar side="l" top={4} offset={14} w={14} h={25} className="pb-ear-l" />
        <TriangleEar side="r" top={4} offset={14} w={14} h={25} />
        <InnerEar side="l" top={10} offset={20} w={8} h={15} />
        <InnerEar side="r" top={10} offset={20} w={8} h={15} />
        <Eye side="l" mood={mood} size={20} top={54} offset={30} shine={7} secondShine />
        <Eye side="r" mood={mood} size={20} top={54} offset={30} shine={7} secondShine />
        <Nose top={76} style="dot" />
        <Mouth top={81} mood={mood} />
        <Blush top={58} left={12} w={14} h={12} opacity={0.7} />
        <Blush top={58} right={12} w={14} h={12} opacity={0.7} />
      </div>
      <Tail bottom={22} right={-6} w={42} h={12} />
    </>
  );
}
