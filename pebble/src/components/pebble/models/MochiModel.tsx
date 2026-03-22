import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, InnerEar, Nose, Blush, Tail } from './SharedParts';

export default function MochiModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      <div className="pb-blob" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 120, background: 'var(--pebble-color)', borderRadius: '50% 50% 48% 48%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
        <TriangleEar side="l" top={4} offset={14} w={13} h={24} />
        <TriangleEar side="r" top={4} offset={14} w={13} h={24} />
        <InnerEar side="l" top={10} offset={20} />
        <InnerEar side="r" top={10} offset={20} />
        <Eye side="l" mood={mood} size={18} top={50} offset={30} shine={6} secondShine />
        <Eye side="r" mood={mood} size={18} top={50} offset={30} shine={6} secondShine />
        <Nose top={70} style="dot" />
        <Blush top={65} left={16} opacity={0.7} />
        <Blush top={65} right={16} opacity={0.7} />
      </div>
      <Tail bottom={20} right={-6} w={40} h={12} />
    </>
  );
}
