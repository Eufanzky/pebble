import { describe, expect, it } from 'vitest';
import type { Task } from '@/features/tasks';
import type { UserPreferences } from '@/shared/preferences';
import type { ChatResponse } from '../types';
import {
  CHAT_ERROR_TEXT,
  buildChatRequest,
  errorMessage,
  replyActivity,
  replyMessage,
  replyMood,
  userMessage,
} from './chat';

const preferences: UserPreferences = {
  readingLevel: 3,
  chunkSize: 'small',
  reduceAnimations: false,
  calmMode: false,
  pebbleColor: 'sage',
  pebblePersonality: 'calm',
  pebbleModel: 'classic',
  voiceInput: false,
};

function task(title: string, completed: boolean): Task {
  return { id: title, title, timeEstimate: '5 min', tag: 'study', priority: 'low', completed };
}

function reply(overrides: Partial<ChatResponse> = {}): ChatResponse {
  return { intent: 'chat', response: 'Hi.', mood: 'happy', agentName: 'PebbleVoice', data: null, ...overrides };
}

describe('buildChatRequest', () => {
  it('sends task stats, the last three finished titles and the preferences', () => {
    const tasks = [task('a', true), task('b', false), task('c', true), task('d', true), task('e', true)];

    expect(buildChatRequest('Hello', tasks, preferences, 'evening')).toEqual({
      message: 'Hello',
      tasksCompleted: 4,
      tasksTotal: 5,
      recentTaskTitles: ['c', 'd', 'e'],
      chunkSize: 'small',
      readingLevel: 3,
      timeOfDay: 'evening',
      personality: 'calm',
    });
  });

  it('works with no tasks', () => {
    expect(buildChatRequest('Hi', [], preferences, 'day')).toMatchObject({
      tasksCompleted: 0,
      tasksTotal: 0,
      recentTaskTitles: [],
    });
  });
});

describe('messages', () => {
  it('builds user, reply and error messages', () => {
    expect(userMessage('Hi', 1)).toEqual({ id: 'u-1', role: 'user', text: 'Hi' });
    expect(replyMessage(reply({ intent: 'distress', mood: 'normal' }), 2)).toEqual({
      id: 'a-2',
      role: 'assistant',
      text: 'Hi.',
      agentName: 'PebbleVoice',
      mood: 'normal',
      intent: 'distress',
    });
    expect(errorMessage(3)).toEqual({ id: 'e-3', role: 'error', text: CHAT_ERROR_TEXT });
  });
});

describe('replyMood', () => {
  it.each(['sleepy', 'normal', 'happy', 'excited'])('keeps %s', (mood) => {
    expect(replyMood(reply({ mood }))).toBe(mood);
  });

  it.each(['', 'furious'])('ignores %j', (mood) => {
    expect(replyMood(reply({ mood }))).toBeNull();
  });
});

describe('replyActivity', () => {
  it('names the agent and shortens the message', () => {
    const long = 'x'.repeat(80);

    expect(replyActivity(long, reply({ agentName: 'CalmSense', intent: 'decompose', mood: 'normal' }))).toEqual({
      agent: 'CalmSense',
      action: `Chat: decompose — "${'x'.repeat(50)}"`,
      reasoning: 'Routed to CalmSense. Mood: normal.',
    });
  });

  it('falls back to PebbleVoice for an unknown agent name', () => {
    expect(replyActivity('Hi', reply({ agentName: '' })).agent).toBe('PebbleVoice');
  });
});
