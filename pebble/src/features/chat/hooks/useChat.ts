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
  replyActivity,
  replyMessage,
  replyMood,
  userMessage,
} from '../lib/chat';
import type { ChatMessage } from '../types';

const MOOD_FLASH_MS = 3000;

/**
 * The conversation with Pebble: sends a message with the user's context,
 * shows the reply, flashes Pebble's mood and logs which agent answered.
 */
export function useChat() {
  const { preferences } = usePreferences();
  const { flashMood } = usePebble();
  const { tasks } = useTasks();
  const { addEntry } = useActivityLog();
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
        setMessages((prev) => [...prev, replyMessage(reply)]);

        const mood = replyMood(reply);
        if (mood) flashMood(mood, MOOD_FLASH_MS);

        const { agent, action, reasoning } = replyActivity(text, reply);
        addEntry(agent, action, reasoning);
      } catch {
        setMessages((prev) => [...prev, errorMessage()]);
      } finally {
        setIsLoading(false);
      }
      return true;
    },
    [isLoading, tasks, preferences, timeOfDay, flashMood, addEntry],
  );

  return { messages, isLoading, send };
}
