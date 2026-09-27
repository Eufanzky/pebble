import { PebbleCharacter, PebbleSpeechBubble, type PebbleMood } from '@/features/companion';
import type { RoomInfo } from '../data/rooms';
import type { TimerState } from '../hooks/useFocusTimer';
import { formatTime } from '../lib/timer';
import RoomSeats from './RoomSeats';
import TimerControls from './TimerControls';

interface RoomOverlayProps {
  room: RoomInfo;
  message: string;
  mood: PebbleMood;
  secondsLeft: number;
  timerState: TimerState;
  noMotion: boolean;
  onLeave: () => void;
  onStart: () => void;
  onPause: () => void;
}

/** Inside a sample room: everyone around Pebble, and the same timer. */
export default function RoomOverlay({ room, message, mood, secondsLeft, timerState, noMotion, onLeave, onStart, onPause }: RoomOverlayProps) {
  const running = timerState === 'running';
  const focusing = room.users.filter((u) => u.focusing).length + (running ? 1 : 0);

  return (
    <div
      role="dialog"
      aria-label={room.name}
      style={{
        position: 'fixed', inset: 0, zIndex: 55,
        background: 'rgba(15,13,10,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column',
        animation: noMotion ? 'none' : 'roomFadeIn 0.3s ease',
      }}
    >
      <style>{`@keyframes roomFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>

      <div style={{
        padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,248,235,0.06)',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 20, color: 'var(--text-primary)' }}>{room.name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{room.people + 1} people in room</div>
        </div>
        <button onClick={onLeave} className="study-btn study-btn-secondary" style={{ padding: '8px 20px' }}>
          Leave Room
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 20 }}>
        <PebbleSpeechBubble message={message} />

        <div style={{ position: 'relative', width: 320, height: 320 }}>
          <div style={{ position: 'absolute', inset: 30, borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,181,212,0.06) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: '1px dashed rgba(255,248,235,0.06)' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <PebbleCharacter mood={running ? 'happy' : mood} size="medium" />
          </div>
          <RoomSeats users={[...room.users, { name: 'You', color: 'var(--pebble-color)', focusing: running }]} noMotion={noMotion} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{ fontFamily: 'var(--font-jetbrains)', fontSize: 40, color: 'var(--text-primary)', letterSpacing: '2px' }}>
            {formatTime(secondsLeft)}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <TimerControls state={timerState} onStart={onStart} onPause={onPause} onResume={onStart} />
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {focusing} of {room.people + 1} focusing right now
          </div>
        </div>
      </div>
    </div>
  );
}
