import type { CSSProperties } from 'react';
import type { ChatMessage } from '../types';

// Agent badge colors (matches ActivityFeed)
const AGENT_COLORS: Record<string, string> = {
  CalmSense: 'var(--accent-sage)',
  SimplifyCore: 'var(--accent-coral)',
  PebbleVoice: 'var(--accent-lavender)',
  WhyBot: 'var(--accent-amber)',
};

function bubbleStyle(message: ChatMessage): CSSProperties {
  if (message.role === 'user') {
    return { background: 'rgba(196,181,212,0.15)', color: 'var(--text-primary)', borderBottomRightRadius: 4 };
  }
  if (message.role === 'error') {
    return {
      background: 'rgba(232,133,106,0.1)',
      color: 'var(--accent-coral)',
      border: '1px solid rgba(232,133,106,0.2)',
    };
  }
  return {
    background: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    borderBottomLeftRadius: 4,
    ...(message.intent === 'distress' ? {
      borderLeft: '3px solid var(--accent-sage)',
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
          color: AGENT_COLORS[message.agentName] || 'var(--text-muted)',
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
