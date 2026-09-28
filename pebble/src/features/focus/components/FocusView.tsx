'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { playChime } from '@/shared/lib/audio';
import { usePreferences } from '@/shared/preferences';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { formatTime } from '../lib/timer';
import FocusRing from './FocusRing';
import TimerControls from './TimerControls';
import './focus.css';

/** The focus screen: a 25-minute timer, with Pebble working beside you. */
export default function FocusView() {
  const { mood, flashMood } = usePebble();
  const { addEntry } = useActivityLog();
  const { reduceMotion: noMotion } = usePreferences();
  const [message, setMessage] = useState('Ready when you are.');

  const onComplete = useCallback(() => {
    playChime();
    flashMood('excited', 3000);
    setMessage('You focused for 25 minutes. Nice work.');
    addEntry('PebbleVoice', 'Focus session completed. 25 minutes of deep focus.', 'Pomodoro timer completed on the focus page.');
  }, [flashMood, addEntry]);
  const timer = useFocusTimer(onComplete);

  const start = () => {
    timer.start();
    setMessage("I'm right here with you.");
  };
  const pause = () => {
    timer.pause();
    setMessage('Taking a breather? Pick it up whenever you like.');
  };

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>focus</h1>
          <p className="screen-subtitle">A 25-minute timer, with Pebble beside you. Stop whenever you need to.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PebbleSpeechBubble message={message} />
          <PebbleCharacter mood={timer.state === 'running' ? 'happy' : mood} size="small" />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, maxWidth: 420 }}>
        <FocusRing secondsLeft={timer.secondsLeft} noMotion={noMotion} />
        <div role="timer" aria-label="Time left" style={{ fontFamily: 'var(--font-baloo)', fontSize: 48, color: 'var(--text-primary)', lineHeight: 1 }}>
          {formatTime(timer.secondsLeft)}
        </div>
        <TimerControls state={timer.state} onStart={start} onPause={pause} onResume={start} />
      </div>
    </>
  );
}
