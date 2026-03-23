'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ScreenBackground from '@/components/layout/ScreenBackground';
import PebbleCharacter from '@/components/pebble/PebbleCharacter';
import PebbleSpeechBubble from '@/components/pebble/PebbleSpeechBubble';
import { usePebble } from '@/contexts/PebbleContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useToast } from '@/contexts/ToastContext';
import './study.css';

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds

const OTHER_ROOMS = [
  { name: 'Morning Grind', people: 7, colors: ['var(--accent-amber)', 'var(--accent-sage)', 'var(--accent-lavender)', 'var(--accent-coral)', 'var(--accent-sky)'] },
  { name: 'Late Night Club', people: 2, colors: ['var(--accent-coral)', 'var(--accent-sky)'] },
  { name: 'Deep Work Den', people: 5, colors: ['var(--accent-sage)', 'var(--accent-lavender)', 'var(--accent-amber)'] },
  { name: 'Quiet Corner', people: 1, colors: ['var(--accent-lavender)'] },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const freqs = [523, 659, 784];
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.2 + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.2);
      osc.stop(ctx.currentTime + i * 0.2 + 0.5);
    });
  } catch {
    // Web Audio not available — fail silently
  }
}

export default function FocusPage() {
  const { mood, flashMood } = usePebble();
  const { addEntry } = useActivityLog();
  const { preferences } = usePreferences();
  const { showToast } = useToast();
  const noMotion = preferences.reduceAnimations;

  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [pebbleMessage, setPebbleMessage] = useState('Focus with others — no cameras, no pressure');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const elapsed = FOCUS_DURATION - timeLeft;
  const progress = elapsed / FOCUS_DURATION;
  const ringRadius = 54;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc - ringCirc * progress;

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleComplete = useCallback(() => {
    stopInterval();
    playChime();
    flashMood('excited', 3000);
    setPebbleMessage('Great session! You focused for 25 minutes');
    addEntry('PebbleVoice', 'Focus session completed. 25 minutes of deep focus.', 'Pomodoro timer completed in Focus Room.');
    setTimeLeft(FOCUS_DURATION);
    setTimerState('idle');
  }, [stopInterval, flashMood, addEntry]);

  useEffect(() => {
    if (timerState === 'running') {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return FOCUS_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return stopInterval;
  }, [timerState, stopInterval, handleComplete]);

  const handleStart = () => {
    setTimerState('running');
    setPebbleMessage("The room is focused. I'm right here with you.");
  };

  const handlePause = () => {
    stopInterval();
    setTimerState('paused');
    setPebbleMessage('Taking a breather? The room will wait.');
  };

  const handleResume = () => {
    setTimerState('running');
    setPebbleMessage("The room is focused. I'm right here with you.");
  };

  return (
    <>
      <ScreenBackground scene="study" />
      <div className="relative z-[1] p-10 px-12 pb-20">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <div>
            <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>focus room</h1>
            <p className="screen-subtitle">Virtual co-working for studying, working, or creating. No cameras, no pressure.</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <PebbleSpeechBubble message={pebbleMessage} />
            <PebbleCharacter mood={timerState === 'running' ? 'happy' : mood} size="small" />
          </div>
        </div>

        {/* Active Room */}
        <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 16 }}>
            cozy library
          </div>

          <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Table Visualization */}
            <div style={{ flex: '1 1 260px', maxWidth: 320 }}>
              <div className="study-table-scene">
                {/* Table surface */}
                <div className="study-table">
                  {/* Wood grain lines */}
                  <div className="study-table-grain" />
                  {/* Center lamp glow */}
                  <div className="study-table-lamp" />
                </div>

                {/* Seated avatars */}
                <div className={`study-seat study-seat-1 ${noMotion ? '' : 'typing'}`} style={{ top: 16, left: '50%', transform: 'translateX(-50%)' }} />
                <div className={`study-seat study-seat-2 ${noMotion ? '' : 'typing'}`} style={{ bottom: 16, left: 40 }} />
                <div className={`study-seat study-seat-3 ${noMotion ? '' : 'typing'}`} style={{ bottom: 16, right: 40 }} />

                {/* Empty seats */}
                <div className="study-seat-empty" style={{ top: '50%', left: 12, transform: 'translateY(-50%)' }} />
                <div className="study-seat-empty" style={{ top: '50%', right: 12, transform: 'translateY(-50%)' }} />
              </div>

              <div style={{ textAlign: 'center', marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                3 people focusing
              </div>
            </div>

            {/* Pomodoro Timer */}
            <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ position: 'relative', width: 120, height: 120 }}>
                <svg viewBox="0 0 120 120" width={120} height={120}>
                  {/* Track */}
                  <circle
                    cx="60" cy="60" r={ringRadius}
                    fill="none"
                    stroke="var(--border-soft)"
                    strokeWidth="4"
                  />
                  {/* Progress */}
                  <circle
                    cx="60" cy="60" r={ringRadius}
                    fill="none"
                    stroke="var(--accent-lavender)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={ringCirc}
                    strokeDashoffset={ringOffset}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center',
                      transition: noMotion ? 'none' : 'stroke-dashoffset 1s linear',
                    }}
                  />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-jetbrains)', fontSize: 28, color: 'var(--text-primary)',
                  letterSpacing: '1px',
                }}>
                  {formatTime(timeLeft)}
                </div>
              </div>

              <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 48, color: 'var(--text-primary)', lineHeight: 1 }}>
                {formatTime(timeLeft)}
              </div>

              {timerState === 'idle' && (
                <button onClick={handleStart} className="study-btn study-btn-primary">
                  Start Focus Session
                </button>
              )}
              {timerState === 'running' && (
                <button onClick={handlePause} className="study-btn study-btn-secondary">
                  Pause
                </button>
              )}
              {timerState === 'paused' && (
                <button onClick={handleResume} className="study-btn study-btn-primary">
                  Resume
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Other Rooms */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 12 }}>
            other rooms
          </div>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
            {OTHER_ROOMS.map((room) => (
              <button
                key={room.name}
                className="glass-card study-room-card"
                onClick={() => showToast('Room switching coming soon!')}
              >
                <div style={{ fontFamily: 'var(--font-nunito)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
                  {room.name}
                </div>
                <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
                  {room.colors.map((c, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c }} />
                  ))}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {room.people} {room.people === 1 ? 'person' : 'people'}
                  </span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(143,175,138,0.15)', color: 'var(--accent-sage)', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                    Active
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Philosophy note */}
        <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 500 }}>
          No cameras. No microphones. Just the comfort of knowing others are focused too.
        </div>
      </div>
    </>
  );
}
