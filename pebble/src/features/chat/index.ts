// Public API of the chat feature. Code outside `features/chat` imports only
// from here.
export { default as PebbleChat } from './components/PebbleChat';
export { sendChatMessage } from './api/sendChatMessage';
export type { ChatMessage, ChatRequest, ChatResponse } from './types';
