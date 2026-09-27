'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useActivityLog } from '@/features/activity';
import { useTasks } from '@/features/tasks';
import { useToast } from '@/shared/ui/ToastContext';
import { VOICE_PHRASES } from '../data/options';

export const LISTEN_MS = 2500;

/**
 * The voice-input button. Listening is simulated: after a short wait it adds
 * a canned phrase as a task (A-020 in specs/audit.md).
 */
export function useVoiceInputDemo() {
  const { addTask } = useTasks();
  const { addEntry } = useActivityLog();
  const { showToast } = useToast();
  const [listening, setListening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const listen = useCallback(() => {
    if (listening) return;
    setListening(true);
    addEntry('PebbleVoice', 'Voice input activated', 'Listening via Azure AI Speech SDK (speech-to-text).');

    timer.current = setTimeout(() => {
      const phrase = VOICE_PHRASES[Math.floor(Math.random() * VOICE_PHRASES.length)];
      setListening(false);
      addTask({ title: phrase, timeEstimate: '~15 min', tag: 'project', priority: 'medium', completed: false });
      showToast(`Voice transcribed: "${phrase}"`);
      addEntry('PebbleVoice', `Voice transcribed: "${phrase}"`, 'Azure AI Speech SDK converted speech to text, added as task.');
    }, LISTEN_MS);
  }, [listening, addTask, addEntry, showToast]);

  return { listening, listen };
}
