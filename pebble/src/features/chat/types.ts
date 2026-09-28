import type { ApiSchema } from '@/shared/api';

/** What the chat sends to `POST /api/agents/chat`. */
export type ChatRequest = ApiSchema<'ChatRequest'>;

/** The backend's reply. */
export type ChatResponse = ApiSchema<'ChatResponse'>;

/** One message on screen. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  agentName?: string;
  mood?: string;
  intent?: string;
}
