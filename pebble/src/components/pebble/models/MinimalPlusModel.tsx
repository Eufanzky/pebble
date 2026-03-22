import type { PebbleMood } from '@/lib/types';
import { Sparkles, Zzz, TriangleEar, Tail } from './SharedParts';

export default function MinimalPlusModel({ mood }: { mood: PebbleMood }) {
  return (
    <>
      <Sparkles /><Zzz />
      <div className="pb-blob" style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 104, height: 90, background: 'var(--pebble-color)', borderRadius: '50% 50% 44% 44%', boxShadow: '0 2px 4px rgba(0,0,0,0.1), 0 5px 16px rgba(0,0,0,0.15), 0 12px 32px rgba(0,0,0,0.08)' }}>
        <TriangleEar side="l" top={4} offset={10} w={10} h={18} />
        <TriangleEar side="r" top={4} offset={10} w={10} h={18} />
        {/* Ear inners via small divs since ::after isn't available in JSX */}
        <div style={{ position: 'absolute', top: 12, left: 15, width: 0, height: 0, zIndex: 4, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid rgba(232,160,191,0.3)' }} />
        <div style={{ position: 'absolute', top: 12, right: 15, width: 0, height: 0, zIndex: 4, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '10px solid rgba(232,160,191,0.3)' }} />
        {/* Eyes with shadow-blush */}
        <div
          className={`pb-eye eye-l ${mood === 'sleepy' ? 'sleepy' : ''}`}
          style={{ position: 'absolute', width: 10, height: 10, background: '#2A2A2E', borderRadius: '50%', top: 40, left: 30, zIndex: 5, boxShadow: '-6px 8px 8px -4px rgba(232,160,191,0.15), 6px 8px 8px -4px rgba(232,160,191,0.15)' }}
        >
          <div className="pb-shine" style={{ position: 'absolute', width: 3.5, height: 3.5, background: 'white', borderRadius: '50%', top: 1, right: 1 }} />
        </div>
        <div
          className={`pb-eye eye-r ${mood === 'sleepy' ? 'sleepy' : ''}`}
          style={{ position: 'absolute', width: 10, height: 10, background: '#2A2A2E', borderRadius: '50%', top: 40, right: 30, zIndex: 5, boxShadow: '-6px 8px 8px -4px rgba(232,160,191,0.15), 6px 8px 8px -4px rgba(232,160,191,0.15)' }}
        >
          <div className="pb-shine" style={{ position: 'absolute', width: 3.5, height: 3.5, background: 'white', borderRadius: '50%', top: 1, right: 1 }} />
        </div>
        {/* Soft nose */}
        <div style={{ position: 'absolute', top: 53, left: '50%', transform: 'translateX(-50%)', width: 4, height: 3, background: 'rgba(232,160,191,0.6)', borderRadius: '50%', zIndex: 5 }} />
      </div>
      <Tail bottom={18} right={0} w={35} h={10} />
    </>
  );
}
