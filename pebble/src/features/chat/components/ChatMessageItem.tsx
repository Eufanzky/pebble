import type { CSSProperties } from 'react';
import type { ChatMessage } from '../types';

// Agent badge colors (matches ActivityFeed)
const AGENT_COLORS: Record<string, string> = {
  CalmSense: 'var(--color-tag-wellbeing)',
  SimplifyCore: 'var(--color-tag-project)',
  PebbleVoice: 'var(--color-accent)',
  WhyBot: 'var(--color-tag-communication)',
};

function bubbleStyle(message: ChatMessage): CSSProperties {
  if (message.role === 'user') {
    return { background: 'rgba(196,181,212,0.15)', color: 'var(--color-text)', borderBottomRightRadius: 4 };
  }
  if (message.role === 'error') {
    return {
      background: 'rgba(232,133,106,0.1)',
      color: 'var(--color-tag-project)',
      border: '1px solid rgba(232,133,106,0.2)',
    };
  }
  return {
    background: 'var(--color-surface-2)',
    color: 'var(--color-text)',
    borderBottomLeftRadius: 4,
    ...(message.intent === 'distress' ? {
      borderLeft: '3px solid var(--color-tag-wellbeing)',
      background: 'rgba(143,175,138,0.08)',
    } : {}),
  };
}

interface ChatMessageItemProps {
  message: ChatMessage;
  stripEmoji: (text: string) => string;
}

export default function ChatMessageItem({ message, stripEmoji }: ChatMessageItemProps) {
  return (
    <div style={{ alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
      {message.agentName && (
        <div style={{
          fontSize: 10, fontWeight: 600, marginBottom: 4,
          color: AGENT_COLORS[message.agentName] || 'var(--color-text-3)',
        }}>
          {message.agentName}
        </div>
      )}

      <div style={{
        padding: '10px 14px', borderRadius: 14,
        fontFamily: 'var(--font-nunito)', fontSize: 13, lineHeight: 1.5,
        ...bubbleStyle(message),
      }}>
        {message.role === 'assistant' ? stripEmoji(message.text) : message.text}
      </div>
    </div>
  );
}
