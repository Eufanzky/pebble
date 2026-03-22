'use client';

import { usePebble } from '@/contexts/PebbleContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import './PebbleMoods.css';

export default function PebbleCharacter() {
  const { mood } = usePebble();
  const { preferences } = usePreferences();

  const moodClass = `mood-${mood}`;
  const motionClass = preferences.reduceAnimations ? 'reduce-motion' : '';

  return (
    <div className={`cat-container ${moodClass} ${motionClass}`}>
      {/* Sparkles (excited mood) */}
      <div className="cat-sparkles">
        <span className="cat-sparkle" style={{ position: 'absolute', top: 0, left: 5, fontSize: 10, color: 'var(--accent-amber)' }}>&#10022;</span>
        <span className="cat-sparkle" style={{ position: 'absolute', top: -5, right: 0, fontSize: 10, color: 'var(--accent-amber)' }}>&#10022;</span>
        <span className="cat-sparkle" style={{ position: 'absolute', top: 5, left: 45, fontSize: 10, color: 'var(--accent-amber)' }}>&#10022;</span>
        <span className="cat-sparkle" style={{ position: 'absolute', bottom: 30, right: 5, fontSize: 10, color: 'var(--accent-amber)' }}>&#10022;</span>
      </div>

      {/* Zzz (sleepy mood) */}
      <div className="cat-zzz" style={{
        position: 'absolute', top: -8, right: 4, fontSize: 11,
        color: 'var(--text-muted)', opacity: 0, zIndex: 10,
        fontFamily: 'var(--font-baloo)',
      }}>zzz</div>

      {/* Head */}
      <div style={{
        position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)',
        width: 70, height: 70, background: 'var(--pebble-color)',
        borderRadius: '50%', zIndex: 2,
      }}>
        {/* Ears */}
        <div style={{ position: 'absolute', width: 20, height: 20, background: 'var(--pebble-dark, #A89ABC)', zIndex: 3, transform: 'rotate(45deg)', top: 0, left: 16, borderRadius: '6px 0 0 0' }} />
        <div style={{ position: 'absolute', width: 20, height: 20, background: 'var(--pebble-dark, #A89ABC)', zIndex: 3, transform: 'rotate(45deg)', top: 0, right: 16, borderRadius: '0 6px 0 0' }} />
        {/* Inner ears */}
        <div style={{ position: 'absolute', width: 10, height: 10, background: '#F4A7B9', zIndex: 4, transform: 'rotate(45deg)', top: 4, left: 20, borderRadius: '4px 0 0 0' }} />
        <div style={{ position: 'absolute', width: 10, height: 10, background: '#F4A7B9', zIndex: 4, transform: 'rotate(45deg)', top: 4, right: 20, borderRadius: '0 4px 0 0' }} />

        {/* Eyes */}
        <div className={`cat-eye ${mood === 'sleepy' ? 'sleepy' : ''}`} style={{
          position: 'absolute', width: 12, height: 12, background: '#2C2C2A',
          borderRadius: '50%', top: 30, left: 22, zIndex: 5,
        }}>
          {mood !== 'sleepy' && (
            <div style={{ position: 'absolute', width: 4, height: 4, background: 'white', borderRadius: '50%', top: 2, right: 2 }} />
          )}
        </div>
        <div className={`cat-eye ${mood === 'sleepy' ? 'sleepy' : ''}`} style={{
          position: 'absolute', width: 12, height: 12, background: '#2C2C2A',
          borderRadius: '50%', top: 30, right: 22, zIndex: 5,
        }}>
          {mood !== 'sleepy' && (
            <div style={{ position: 'absolute', width: 4, height: 4, background: 'white', borderRadius: '50%', top: 2, right: 2 }} />
          )}
        </div>

        {/* Nose */}
        <div style={{
          position: 'absolute', top: 42, left: '50%', transform: 'translateX(-50%)',
          width: 6, height: 5, background: '#F4A7B9',
          borderRadius: '50% 50% 50% 50% / 40% 40% 60% 60%', zIndex: 5,
        }} />

        {/* Whiskers */}
        <div style={{ position: 'absolute', height: 1, width: 28, background: 'rgba(44,44,42,0.25)', zIndex: 5, top: 44, left: -2, transform: 'rotate(-5deg)' }} />
        <div style={{ position: 'absolute', height: 1, width: 28, background: 'rgba(44,44,42,0.25)', zIndex: 5, top: 48, left: -4, transform: 'rotate(5deg)' }} />
        <div style={{ position: 'absolute', height: 1, width: 28, background: 'rgba(44,44,42,0.25)', zIndex: 5, top: 44, right: -2, transform: 'rotate(5deg)' }} />
        <div style={{ position: 'absolute', height: 1, width: 28, background: 'rgba(44,44,42,0.25)', zIndex: 5, top: 48, right: -4, transform: 'rotate(-5deg)' }} />

        {/* Blush */}
        <div className="cat-blush" style={{
          position: 'absolute', width: 10, height: 7,
          background: 'rgba(244, 167, 185, 0.5)', borderRadius: '50%',
          top: 39, left: 14, zIndex: 5, opacity: 0, transition: 'opacity 0.3s',
        }} />
        <div className="cat-blush" style={{
          position: 'absolute', width: 10, height: 7,
          background: 'rgba(244, 167, 185, 0.5)', borderRadius: '50%',
          top: 39, right: 14, zIndex: 5, opacity: 0, transition: 'opacity 0.3s',
        }} />
      </div>

      {/* Body */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: 80, height: 60, background: 'var(--pebble-color)',
        borderRadius: '40px 40px 35px 35px',
      }} />

      {/* Tail */}
      <div className="cat-tail" style={{
        position: 'absolute', bottom: 12, right: -6,
        width: 55, height: 12, background: 'var(--pebble-color)',
        borderRadius: '0 50px 50px 0', zIndex: 1,
      }} />
    </div>
  );
}
