import type { Task } from '@/features/tasks';
import type { ActivityEntry, PebbleMood, TimeOfDay, UserPreferences } from '@/lib/types';
import type { ChatMessage, ChatRequest, ChatResponse } from '../types';

/** Shown instead of the raw error: a status code means nothing to the user. */
export const CHAT_ERROR_TEXT = "Pebble couldn't answer just now. Try again whenever you're ready.";

const MOODS: readonly PebbleMood[] = ['sleepy', 'normal', 'happy', 'excited'];
const AGENTS: readonly ActivityEntry['agent'][] = [
  'CalmSense', 'AdaptLens', 'SimplifyCore', 'PebbleVoice', 'WhyBot', 'BridgeBot',
];

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
    tasks_completed: completed.length,
    tasks_total: tasks.length,
    recent_task_titles: completed.slice(-3).map((t) => t.title),
    chunk_size: preferences.chunkSize,
    reading_level: preferences.readingLevel,
    time_of_day: timeOfDay,
    personality: preferences.pebblePersonality,
  };
}

export function userMessage(text: string, now = Date.now()): ChatMessage {
  return { id: `u-${now}`, role: 'user', text };
}

export function replyMessage(reply: ChatResponse, now = Date.now()): ChatMessage {
  return {
    id: `a-${now}`,
    role: 'assistant',
    text: reply.response,
    agentName: reply.agentName,
    mood: reply.mood,
    intent: reply.intent,
  };
}

export function errorMessage(now = Date.now()): ChatMessage {
  return { id: `e-${now}`, role: 'error', text: CHAT_ERROR_TEXT };
}

/** The reply's mood, if it's one Pebble can show. */
export function replyMood(reply: ChatResponse): PebbleMood | null {
  return MOODS.includes(reply.mood as PebbleMood) ? (reply.mood as PebbleMood) : null;
}

/** The activity-log entry for a reply: which agent answered, and why. */
export function replyActivity(message: string, reply: ChatResponse) {
  const agent = AGENTS.includes(reply.agentName as ActivityEntry['agent'])
    ? (reply.agentName as ActivityEntry['agent'])
    : 'PebbleVoice';
  return {
    agent,
    action: `Chat: ${reply.intent} — "${message.slice(0, 50)}"`,
    reasoning: `Routed to ${reply.agentName}. Mood: ${reply.mood}.`,
  };
}
