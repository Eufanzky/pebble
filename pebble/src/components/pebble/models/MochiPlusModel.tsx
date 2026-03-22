import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, Eye, TriangleEar, InnerEar, Nose, Blush, Tail } from './SharedParts';

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
        {/* Whisper mouth via tiny border */}
        <div style={{ position: 'absolute', top: 81, left: '50%', transform: 'translateX(-50%)', width: 8, height: 3, borderBottom: '1px solid rgba(42,42,46,0.18)', borderRadius: '0 0 50% 50%', zIndex: 5 }} />
        {/* Always-visible blush beside eyes */}
        <Blush top={60} left={14} w={14} h={8} opacity={0.7} />
        <Blush top={60} right={14} w={14} h={8} opacity={0.7} />
      </div>
      <Tail bottom={22} right={-6} w={42} h={12} />
    </>
  );
}
