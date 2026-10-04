import { postJson } from '@/shared/lib/api';
import type { ChatRequest, ChatResponse } from '../types';

export function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  return postJson<ChatResponse>('/api/agents/chat', request);
}
