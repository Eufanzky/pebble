/**
 * API client for the Focusbuddy backend.
 * All requests go through Next.js rewrites → http://localhost:8000.
 */

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

export interface ChatResponse {
  intent: string;
  response: string;
  mood: string;
  agentName: string;
  data: Record<string, unknown> | null;
}

export async function sendChatMessage(
  params: ChatRequest,
): Promise<ChatResponse> {
  const res = await fetch("/api/agents/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "Unknown error");
    throw new Error(`Chat request failed (${res.status}): ${detail}`);
  }

  return res.json();
}
