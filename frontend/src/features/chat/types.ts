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
  /** CalmSense's steps, when it broke something down: they can be added to Today. */
  breakdown?: ChatBreakdown;
  /** The breakdown is on Today now. */
  added?: boolean;
}

export interface ChatBreakdown {
  title: string;
  steps: { title: string; timeEstimate: string }[];
  whyExplanation: string;
}
