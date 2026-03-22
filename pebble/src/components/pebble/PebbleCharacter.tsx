'use client';

import { usePreferences } from '@/contexts/PreferencesContext';
import type { PebbleMood } from '@/lib/types';
import './PebbleMoods.css';

interface PebbleCharacterProps {
  mood?: PebbleMood;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export default function PebbleCharacter({
  mood = 'normal',
  size = 'large',
  className = '',
}: PebbleCharacterProps) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;

  return (
    <div
      className={`pebble-container size-${size} mood-${mood} ${noMotion ? 'no-motion' : ''} ${className}`}
    >
      {/* Sparkles (excited mood) */}
      <div className="pebble-sparkles">
        <span className="pebble-sparkle">&#10022;</span>
        <span className="pebble-sparkle">&#10022;</span>
        <span className="pebble-sparkle">&#10022;</span>
        <span className="pebble-sparkle">&#10022;</span>
      </div>

      {/* Zzz (sleepy mood) */}
      <div className="pebble-zzz">zzz</div>

      {/* Animated body group (handles float) */}
      <div className="pebble-body-group" style={{ position: 'absolute', inset: 0 }}>
        {/* Tail (behind body) */}
        <div
          className="pebble-tail"
          style={{
            position: 'absolute',
            bottom: 16,
            right: -2,
            width: 50,
            height: 14,
            background: 'var(--pebble-color)',
            borderRadius: '0 50px 50px 0',
            zIndex: 0,
          }}
        />

        {/* Body */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 80,
            background: 'var(--pebble-color)',
            borderRadius: '50% 50% 45% 45%',
            zIndex: 1,
            boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
          }}
        />

        {/* Head */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 90,
            height: 90,
            background: 'var(--pebble-color)',
            borderRadius: '50%',
            zIndex: 2,
          }}
        >
          {/* Left ear - outer */}
          <div style={{
            position: 'absolute', top: -6, left: 10,
            width: 0, height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '22px solid var(--pebble-color)',
            zIndex: 3,
          }} />
          {/* Right ear - outer */}
          <div style={{
            position: 'absolute', top: -6, right: 10,
            width: 0, height: 0,
            borderLeft: '12px solid transparent',
            borderRight: '12px solid transparent',
            borderBottom: '22px solid var(--pebble-color)',
            zIndex: 3,
          }} />
          {/* Left ear - inner pink */}
          <div style={{
            position: 'absolute', top: 0, left: 16,
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: '13px solid rgba(232,160,191,0.6)',
            zIndex: 4,
          }} />
          {/* Right ear - inner pink */}
          <div style={{
            position: 'absolute', top: 0, right: 16,
            width: 0, height: 0,
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderBottom: '13px solid rgba(232,160,191,0.6)',
            zIndex: 4,
          }} />

          {/* Left eye */}
          <div
            className={`pebble-eye ${mood === 'sleepy' ? 'sleepy' : ''}`}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              background: '#2A2A2E',
              borderRadius: '50%',
              top: 34,
              left: 26,
              zIndex: 5,
              transform: mood === 'happy' || mood === 'excited' ? 'scale(1.1)' : undefined,
            }}
          >
            <div
              className="pebble-eye-shine"
              style={{
                position: 'absolute', width: 4, height: 4,
                background: 'white', borderRadius: '50%',
                top: 2, right: 2,
              }}
            />
          </div>

          {/* Right eye */}
          <div
            className={`pebble-eye ${mood === 'sleepy' ? 'sleepy' : ''}`}
            style={{
              position: 'absolute',
              width: 12,
              height: 12,
              background: '#2A2A2E',
              borderRadius: '50%',
              top: 34,
              right: 26,
              zIndex: 5,
              transform: mood === 'happy' || mood === 'excited' ? 'scale(1.1)' : undefined,
            }}
          >
            <div
              className="pebble-eye-shine"
              style={{
                position: 'absolute', width: 4, height: 4,
                background: 'white', borderRadius: '50%',
                top: 2, right: 2,
              }}
            />
          </div>

          {/* Nose - inverted pink triangle */}
          <div style={{
            position: 'absolute',
            top: 47,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '3px solid transparent',
            borderRight: '3px solid transparent',
            borderTop: '4px solid #E8A0BF',
            zIndex: 5,
          }} />

          {/* Whiskers */}
          <div style={{ position: 'absolute', height: 1, width: 24, background: 'rgba(42,42,46,0.2)', zIndex: 5, top: 50, left: 2, transform: 'rotate(-8deg)' }} />
          <div style={{ position: 'absolute', height: 1, width: 22, background: 'rgba(42,42,46,0.15)', zIndex: 5, top: 54, left: 0, transform: 'rotate(5deg)' }} />
          <div style={{ position: 'absolute', height: 1, width: 24, background: 'rgba(42,42,46,0.2)', zIndex: 5, top: 50, right: 2, transform: 'rotate(8deg)' }} />
          <div style={{ position: 'absolute', height: 1, width: 22, background: 'rgba(42,42,46,0.15)', zIndex: 5, top: 54, right: 0, transform: 'rotate(-5deg)' }} />

          {/* Left blush */}
          <div
            className="pebble-blush"
            style={{
              position: 'absolute',
              width: 14, height: 8,
              background: 'rgba(232,160,191,0.3)',
              borderRadius: '50%',
              top: 44, left: 14,
              zIndex: 5,
              opacity: 0,
              transition: 'opacity 0.4s ease',
            }}
          />
          {/* Right blush */}
          <div
            className="pebble-blush"
            style={{
              position: 'absolute',
              width: 14, height: 8,
              background: 'rgba(232,160,191,0.3)',
              borderRadius: '50%',
              top: 44, right: 14,
              zIndex: 5,
              opacity: 0,
              transition: 'opacity 0.4s ease',
            }}
          />
        </div>
      </div>
    </div>
  );
}
