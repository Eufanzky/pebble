import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, InnerEar, Nose, Blush, Tail, Whiskers } from './SharedParts';

export default function ClassicModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      <div className="pb-body-group" style={{ position: 'absolute', inset: 0 }}>
        <Tail bottom={16} right={-2} w={50} h={14} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 80, background: 'var(--pebble-color)', borderRadius: '50% 50% 45% 45%', zIndex: 1, boxShadow: '0 6px 20px rgba(0,0,0,0.25)' }} />
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', width: 90, height: 90, background: 'var(--pebble-color)', borderRadius: '50%', zIndex: 2 }}>
          <TriangleEar side="l" top={-6} offset={10} w={12} h={22} />
          <TriangleEar side="r" top={-6} offset={10} w={12} h={22} />
          <InnerEar side="l" top={0} offset={16} w={7} h={13} />
          <InnerEar side="r" top={0} offset={16} w={7} h={13} />
          <Eye side="l" mood={mood} size={12} top={34} offset={26} shine={4} />
          <Eye side="r" mood={mood} size={12} top={34} offset={26} shine={4} />
          <Nose top={47} />
          <Whiskers top={50} />
          <Blush top={44} left={14} />
          <Blush top={44} right={14} />
        </div>
      </div>
    </>
  );
}
