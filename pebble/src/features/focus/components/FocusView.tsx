'use client';

import { useCallback, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { playChime } from '@/shared/lib/audio';
import { usePreferences } from '@/shared/preferences';
import type { RoomInfo } from '../data/rooms';
import { useFocusTimer } from '../hooks/useFocusTimer';
import { useRoomJoin } from '../hooks/useRoomJoin';
import { formatTime } from '../lib/timer';
import FocusRing from './FocusRing';
import RoomList from './RoomList';
import RoomLoading from './RoomLoading';
import RoomOverlay from './RoomOverlay';
import StudyTable from './StudyTable';
import TimerControls from './TimerControls';
import './study.css';

const FOCUSED = "The room is focused. I'm right here with you.";

/** The focus screen: a 25-minute timer in a (sample) shared room. */
export default function FocusView() {
  const { mood, flashMood } = usePebble();
  const { addEntry } = useActivityLog();
  const { preferences, reduceMotion: noMotion } = usePreferences();
  const [message, setMessage] = useState('Focus with others — no cameras, no pressure');

  const onComplete = useCallback(() => {
    playChime();
    flashMood('excited', 3000);
    setMessage('Great session! You focused for 25 minutes');
    addEntry('PebbleVoice', 'Focus session completed. 25 minutes of deep focus.', 'Pomodoro timer completed in Focus Room.');
  }, [flashMood, addEntry]);
  const timer = useFocusTimer(onComplete);

  const onJoined = useCallback((room: RoomInfo) => {
    addEntry('PebbleVoice', `Joined room "${room.name}"`, `Room has ${room.people} participants. No cameras, presence only.`);
    setMessage(`Welcome to ${room.name}! ${room.people} others are here.`);
  }, [addEntry]);
  const rooms = useRoomJoin(onJoined);

  const start = () => {
    timer.start();
    setMessage(FOCUSED);
  };
  const pause = () => {
    timer.pause();
    setMessage('Taking a breather? The room will wait.');
  };
  const leave = () => {
    if (rooms.room) addEntry('PebbleVoice', `Left room "${rooms.room.name}"`, 'User returned to room lobby.');
    rooms.leave();
    setMessage('Welcome back! You can join another room anytime.');
  };
  const pebbleMood = timer.state === 'running' ? 'happy' : mood;

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 className="screen-title" style={{ textTransform: 'lowercase' }}>focus room</h1>
          <p className="screen-subtitle">Virtual co-working for studying, working, or creating. No cameras, no pressure.</p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <PebbleSpeechBubble message={message} />
          <PebbleCharacter mood={pebbleMood} size="small" />
        </div>
      </div>

      <div className="glass-card" style={{ padding: '28px 32px', marginBottom: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', marginBottom: 16 }}>
          cozy library
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <StudyTable noMotion={noMotion} />
          <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <FocusRing secondsLeft={timer.secondsLeft} noMotion={noMotion} />
            <div role="timer" aria-label="Time left" style={{ fontFamily: 'var(--font-baloo)', fontSize: 48, color: 'var(--text-primary)', lineHeight: 1 }}>
              {formatTime(timer.secondsLeft)}
            </div>
            <TimerControls state={timer.state} onStart={start} onPause={pause} onResume={start} />
          </div>
        </div>
      </div>

      <RoomList onJoin={rooms.join} />

      <div style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 500 }}>
        No cameras. No microphones. Just the comfort of knowing others are focused too.
      </div>

      {rooms.joining && <RoomLoading step={rooms.step} calm={preferences.calmMode} noMotion={noMotion} />}
      {rooms.room && (
        <RoomOverlay
          room={rooms.room}
          message={message}
          mood={mood}
          secondsLeft={timer.secondsLeft}
          timerState={timer.state}
          noMotion={noMotion}
          onLeave={leave}
          onStart={start}
          onPause={pause}
        />
      )}
    </>
  );
}
