'use client';

import { useCallback, useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { usePebble } from '@/features/companion';
import { useTasks } from '@/features/tasks';
import { useActivityLog } from '@/features/activity';
import { useTimeOfDay } from '@/shared/hooks/useTimeOfDay';
import { sendChatMessage } from '../api/sendChatMessage';
import {
  buildChatRequest,
  errorMessage,
  replyMessage,
  replyMood,
  userMessage,
} from '../lib/messages';
import type { ChatMessage } from '../types';

const MOOD_FLASH_MS = 3000;

/**
 * The conversation with Pebble: sends a message with the user's context,
 * shows the reply and flashes Pebble's mood. The backend logs which agent
 * answered; the activity log reloads to show it.
 */
export function useChat() {
  const { preferences } = usePreferences();
  const { flashMood } = usePebble();
  const { tasks, addTask } = useTasks();
  const { refresh: refreshLog } = useActivityLog();
  const timeOfDay = useTimeOfDay();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || isLoading) return false;

      setMessages((prev) => [...prev, userMessage(text)]);
      setIsLoading(true);

      try {
        const reply = await sendChatMessage(buildChatRequest(text, tasks, preferences, timeOfDay));
        setMessages((prev) => [...prev, replyMessage(reply, Date.now(), text)]);

        const mood = replyMood(reply);
        if (mood) flashMood(mood, MOOD_FLASH_MS);
      } catch {
        setMessages((prev) => [...prev, errorMessage()]);
      } finally {
        setIsLoading(false);
        // The backend logs every turn itself (and a message it held back): show it
        refreshLog();
      }
      return true;
    },
    [isLoading, tasks, preferences, timeOfDay, flashMood, refreshLog],
  );

  /** Puts a CalmSense breakdown from the chat on Today, as a task with its steps and its "why". */
  const addToToday = useCallback(
    (messageId: string) => {
      const message = messages.find((m) => m.id === messageId);
      if (!message?.breakdown || message.added) return;
      const { title, steps, whyExplanation } = message.breakdown;
      addTask({
        title,
        timeEstimate: '',
        tag: 'project',
        priority: 'medium',
        completed: false,
        whyExplanation,
        steps: steps.map((s) => ({ id: '', title: s.title, timeEstimate: s.timeEstimate, completed: false })),
        showSteps: true,
      });
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, added: true } : m)));
    },
    [messages, addTask],
  );

  return { messages, isLoading, send, addToToday };
}
