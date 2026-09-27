import { PebbleCharacter } from '@/features/companion';
import { JOIN_STEPS } from '../hooks/useRoomJoin';

const STEPS = [
  'Connecting to room...',
  'Finding your seat...',
  'Saying hi to everyone...',
  'Setting up your space...',
  'Almost there...',
];

interface RoomLoadingProps {
  step: number;
  calm: boolean;
  noMotion: boolean;
}

/** The staged screen shown while joining a room. */
export default function RoomLoading({ step, calm, noMotion }: RoomLoadingProps) {
  return (
    <div role="status" aria-label="Joining the room" style={{
      position: 'fixed', inset: 0, zIndex: 56,
      background: 'var(--bg-deep)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28,
    }}>
      {/* Pebble walking animation */}
      <div style={{
        animation: noMotion ? 'none' : 'pebbleBounce 0.8s ease-in-out infinite',
      }}>
        <PebbleCharacter mood="happy" size="medium" />
      </div>
      <style>{`
        @keyframes pebbleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes stepFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Loading steps */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {STEPS.map((text, i) => (
          <div
            key={i}
            style={{
              fontFamily: 'var(--font-nunito)', fontSize: 13,
              color: i <= step ? 'var(--text-secondary)' : 'transparent',
              transition: noMotion ? 'none' : 'color 0.3s ease',
              animation: i === step && !noMotion ? 'stepFade 0.3s ease' : 'none',
            }}
          >
            {i < step ? (calm ? 'Done' : '\u2713') : ''} {text}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ width: 200, height: 3, borderRadius: 2, background: 'var(--border-soft)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 2,
          background: 'var(--accent-lavender)',
          width: `${(step / JOIN_STEPS) * 100}%`,
          transition: noMotion ? 'none' : 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}
