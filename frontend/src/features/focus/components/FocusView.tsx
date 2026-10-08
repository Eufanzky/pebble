'use client';

import { useCallback, useState } from 'react';
import { PebbleCharacter, PebbleSpeechBubble, usePebble } from '@/features/companion';
import { postFocusSession } from '@/features/stats';
import { STATS_KEY } from '@/shared/lib/query';
import { useQueryClient } from '@tanstack/react-query';
import { playChime } from '@/shared/lib/audio';
import { usePreferences } from '@/shared/preferences';
import { Card, Screen, ScreenHeader } from '@/shared/ui';
import { useFocusTimer } from '../hooks/useFocusTimer';
import FocusRing from './FocusRing';
import TimerControls from './TimerControls';
import './focus.css';

/** The focus screen: a 25-minute timer, with Pebble working beside you. */
export default function FocusView() {
  const { mood, flashMood } = usePebble();
  const { reduceMotion: noMotion } = usePreferences();
  const [message, setMessage] = useState('Ready when you are.');
  const queryClient = useQueryClient();

  const onComplete = useCallback(() => {
    playChime();
    flashMood('excited', 3000);
    setMessage('You focused for 25 minutes. Nice work.');
    // The minutes count towards progress (5.6); a stats page open elsewhere picks them up
    postFocusSession(25)
      .then(() => queryClient.invalidateQueries({ queryKey: STATS_KEY }))
      .catch(() => undefined);
  }, [flashMood, queryClient]);
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
    <Screen width="narrow">
      <ScreenHeader
        title="Focus"
        lead="A 25-minute timer, with Pebble beside you. Stop whenever you need to."
        companion={<PebbleCharacter mood={timer.state === 'running' ? 'happy' : mood} size="small" />}
      />

      <Card as="section" padding="lg" className="focus-card" aria-label="Focus timer">
        <PebbleSpeechBubble message={message} />
        <FocusRing secondsLeft={timer.secondsLeft} noMotion={noMotion} />
        <TimerControls state={timer.state} onStart={start} onPause={pause} onResume={start} />
      </Card>
    </Screen>
  );
}
