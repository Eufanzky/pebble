import type { Task } from '@/features/tasks';
import type { PebbleMood } from '@/features/companion';
import type { TimeOfDay } from '@/shared/hooks/useTimeOfDay';
import type { UserPreferences } from '@/shared/preferences';
import type { ChatBreakdown, ChatMessage, ChatRequest, ChatResponse } from '../types';

/** Shown instead of the raw error: a status code means nothing to the user. */
export const CHAT_ERROR_TEXT = "Pebble couldn't answer just now. Try again whenever you're ready.";

const MOODS: readonly PebbleMood[] = ['sleepy', 'normal', 'happy', 'excited'];

/** The request body: the message plus the context Pebble tailors its reply to. */
export function buildChatRequest(
  message: string,
  tasks: Task[],
  preferences: UserPreferences,
  timeOfDay: TimeOfDay,
): ChatRequest {
  const completed = tasks.filter((t) => t.completed);
  return {
    message,
    tasksCompleted: completed.length,
    tasksTotal: tasks.length,
    recentTaskTitles: completed.slice(-3).map((t) => t.title),
    stepSize: preferences.stepSize,
    readingLevel: preferences.readingLevel,
    timeOfDay,
    personality: preferences.pebblePersonality,
  };
}

export function userMessage(text: string, now = Date.now()): ChatMessage {
  return { id: `u-${now}`, role: 'user', text };
}

/**
 * The reply as a message. A CalmSense breakdown keeps its steps, named by CalmSense's title or, failing
 * that, by what the user asked.
 */
export function replyMessage(reply: ChatResponse, now = Date.now(), asked = ''): ChatMessage {
  const breakdown = breakdownOf(reply, asked);
  return {
    id: `a-${now}`,
    role: 'assistant',
    text: reply.response,
    agentName: reply.agentName,
    mood: reply.mood,
    intent: reply.intent,
    ...(breakdown ? { breakdown } : {}),
  };
}

function breakdownOf(reply: ChatResponse, asked: string): ChatBreakdown | undefined {
  const data = reply.data as Partial<ChatBreakdown> | null | undefined;
  if (reply.intent !== 'decompose' || !data || !Array.isArray(data.steps) || data.steps.length === 0) return undefined;
  return {
    title: (data.title?.trim() || asked.trim()).slice(0, 200),
    steps: data.steps.map((s) => ({ title: s.title, timeEstimate: s.timeEstimate ?? '' })),
    whyExplanation: data.whyExplanation ?? '',
  };
}

export function errorMessage(now = Date.now()): ChatMessage {
  return { id: `e-${now}`, role: 'error', text: CHAT_ERROR_TEXT };
}

/** The reply's mood, if it's one Pebble can show. */
export function replyMood(reply: ChatResponse): PebbleMood | null {
  return MOODS.includes(reply.mood as PebbleMood) ? (reply.mood as PebbleMood) : null;
}
