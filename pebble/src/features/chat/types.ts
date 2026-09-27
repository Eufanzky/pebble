/** What the chat sends to `POST /api/agents/chat`. */
export interface ChatRequest {
  message: string;
  tasks_completed: number;
  tasks_total: number;
  recent_task_titles: string[];
  chunk_size: string;
  reading_level: number;
  time_of_day: string;
  personality: string;
}

/** The backend's reply. Must match `ChatResponse` in the backend schemas. */
export interface ChatResponse {
  intent: string;
  response: string;
  mood: string;
  agentName: string;
  data: Record<string, unknown> | null;
}

/** One message on screen. */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  agentName?: string;
  mood?: string;
  intent?: string;
}
