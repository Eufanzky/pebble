import { useEffect, useRef, useState } from 'react';
import type { ChatMessage } from '../types';
import ChatInput from './ChatInput';
import ChatMessageItem from './ChatMessageItem';
import ChatThinking from './ChatThinking';

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSend: (text: string) => Promise<boolean>;
  onClose: () => void;
  noMotion: boolean;
  stripEmoji: (text: string) => string;
}

/** The open chat: header, messages, and the input. */
export default function ChatPanel({ messages, isLoading, onSend, onClose, noMotion, stripEmoji }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input when the panel opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to the newest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: noMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading, noMotion]);

  const handleSend = () => {
    const text = input;
    if (!text.trim() || isLoading) return;
    setInput('');
    void onSend(text);
  };

  return (
    <div
      role="dialog"
      aria-label="Chat with Pebble"
      style={{
        position: 'fixed', bottom: 'calc(90px + var(--app-bottom-inset, 0px))', right: 16, zIndex: 50,
        width: 'min(380px, calc(100vw - 32px))',
        maxHeight: 'min(520px, calc(100dvh - 120px - var(--app-bottom-inset, 0px)))',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(20,18,14,0.95)',
        border: '1px solid var(--glass-border)',
        borderRadius: 20, overflow: 'hidden',
        boxShadow: '0 16px 60px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        animation: noMotion ? 'none' : 'chatSlideUp 0.25s ease',
      }}
    >
      <style>{`@keyframes chatSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      {/* Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid rgba(255,248,235,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <div style={{ fontFamily: 'var(--font-baloo)', fontSize: 15, color: 'var(--text-primary)' }}>
            Chat with Pebble
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            Ask me anything, or tell me how you feel
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close chat"
          style={{
            width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border-soft)',
            background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer',
            fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          &times;
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 10,
        minHeight: 200, maxHeight: 340,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(196,181,212,0.15) transparent',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: 12, lineHeight: 1.6 }}>
            Hi there. I&apos;m Pebble.
            <br />
            Try: &quot;Help me break down writing my essay&quot;
            <br />
            or: &quot;I need some encouragement&quot;
          </div>
        )}

        {messages.map((message) => (
          <ChatMessageItem key={message.id} message={message} stripEmoji={stripEmoji} />
        ))}

        {isLoading && <ChatThinking />}

        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        disabled={isLoading}
        noMotion={noMotion}
        inputRef={inputRef}
      />
    </div>
  );
}
