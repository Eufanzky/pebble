import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, InnerEar, Nose, Mouth, Blush, Tail, Paw } from './SharedParts';

export default function ChonkyModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      <div className="pb-body" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 70, background: 'var(--pebble-color)', borderRadius: '55% 55% 45% 45%', boxShadow: '0 6px 18px rgba(0,0,0,0.22)' }} />
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 100, height: 100, background: 'var(--pebble-color)', borderRadius: '50%', zIndex: 2 }}>
        <TriangleEar side="l" top={-2} offset={10} w={14} h={26} className="pb-ear-l" />
        <TriangleEar side="r" top={-2} offset={10} w={14} h={26} />
        <InnerEar side="l" top={5} offset={17} />
        <InnerEar side="r" top={5} offset={17} />
        <Eye side="l" mood={mood} size={14} top={38} offset={28} shine={5} secondShine />
        <Eye side="r" mood={mood} size={14} top={38} offset={28} shine={5} secondShine />
        <Nose top={53} />
        <Mouth top={57} mood={mood} />
        <Blush top={48} left={10} />
        <Blush top={48} right={10} />
      </div>
      <Tail bottom={16} right={-8} w={50} h={14} />
      <Paw side="l" offset={22} />
      <Paw side="r" offset={22} />
    </>
  );
}
