import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, InnerEar, Nose, Mouth, Blush, Tail, Paw } from './SharedParts';

export default function ChonkyPlusModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      {/* Body with belly highlight + Pusheen stripes (via CSS ::before/::after) */}
      <div className="pb-body" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 122, height: 68, background: 'var(--pebble-color)', borderRadius: '48% 48% 50% 50%', boxShadow: '0 6px 18px rgba(0,0,0,0.22)' }}>
        {/* Belly highlight */}
        <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', width: 58, height: 30, background: 'var(--pebble-light, rgba(255,255,255,0.1))', borderRadius: '50%', opacity: 0.18 }} />
        {/* Stripes */}
        <div style={{ position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)', width: 22, height: 2, background: 'var(--pebble-dark)', borderRadius: 1, opacity: 0.35, boxShadow: '0 6px 0 var(--pebble-dark), 0 12px 0 var(--pebble-dark)' }} />
      </div>
      {/* Head with slow-look animation */}
      <div className="pb-head" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 102, height: 102, background: 'var(--pebble-color)', borderRadius: '50%', zIndex: 2 }}>
        <TriangleEar side="l" top={-2} offset={10} w={14} h={26} className="pb-ear-l" />
        <TriangleEar side="r" top={-2} offset={10} w={14} h={26} />
        <InnerEar side="l" top={5} offset={17} />
        <InnerEar side="r" top={5} offset={17} />
        <Eye side="l" mood={mood} size={17} top={40} offset={28} shine={6} secondShine />
        <Eye side="r" mood={mood} size={17} top={40} offset={28} shine={6} secondShine />
        <Nose top={58} />
        <Mouth top={62} />
        <Blush top={55} left={12} />
        <Blush top={55} right={12} />
      </div>
      <Tail bottom={14} right={-8} w={50} h={14} />
      {/* Paws with pads */}
      <div style={{ position: 'absolute', bottom: -2, left: 22, width: 18, height: 10, background: 'var(--pebble-dark)', borderRadius: '50% 50% 40% 40%', zIndex: 3 }}>
        <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 3, background: 'rgba(232,160,191,0.35)', borderRadius: '50%', boxShadow: '-4px 0 0 rgba(232,160,191,0.25), 4px 0 0 rgba(232,160,191,0.25)' }} />
      </div>
      <div style={{ position: 'absolute', bottom: -2, right: 22, width: 18, height: 10, background: 'var(--pebble-dark)', borderRadius: '50% 50% 40% 40%', zIndex: 3 }}>
        <div style={{ position: 'absolute', top: 2, left: '50%', transform: 'translateX(-50%)', width: 4, height: 3, background: 'rgba(232,160,191,0.35)', borderRadius: '50%', boxShadow: '-4px 0 0 rgba(232,160,191,0.25), 4px 0 0 rgba(232,160,191,0.25)' }} />
      </div>
    </>
  );
}
