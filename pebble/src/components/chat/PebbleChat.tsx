'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { usePebble } from '@/contexts/PebbleContext';
import { useTasks } from '@/contexts/TasksContext';
import { useActivityLog } from '@/contexts/ActivityLogContext';
import { useTimeOfDay } from '@/hooks/useTimeOfDay';
import { sendChatMessage } from '@/lib/api';
import type { ChatResponse } from '@/lib/api';
import type { PebbleMood } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  agentName?: string;
  mood?: string;
  intent?: string;
}

// ---------------------------------------------------------------------------
// Agent badge colors (matches ActivityFeed)
// ---------------------------------------------------------------------------

const AGENT_COLORS: Record<string, string> = {
  CalmSense: 'var(--accent-sage)',
  SimplifyCore: 'var(--accent-coral)',
  PebbleVoice: 'var(--accent-lavender)',
  WhyBot: 'var(--accent-amber)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PebbleChat() {
  const { preferences } = usePreferences();
  const { flashMood } = usePebble();
  const { tasks } = useTasks();
  const { addEntry } = useActivityLog();
  const timeOfDay = useTimeOfDay();
  const noMotion = preferences.reduceAnimations;
  const calm = preferences.calmMode;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: noMotion ? 'auto' : 'smooth' });
  }, [messages, isLoading, noMotion]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const tasksTotal = tasks.length;
  const recentTitles = tasks.filter((t) => t.completed).slice(-3).map((t) => t.title);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response: ChatResponse = await sendChatMessage({
        message: text,
        tasks_completed: tasksCompleted,
        tasks_total: tasksTotal,
        recent_task_titles: recentTitles,
        chunk_size: preferences.chunkSize,
        reading_level: preferences.readingLevel,
        time_of_day: timeOfDay,
        personality: preferences.pebblePersonality,
      });

      const assistantMsg: Message = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: response.response,
        agentName: response.agentName,
        mood: response.mood,
        intent: response.intent,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Flash Pebble mood
      if (response.mood) {
        flashMood(response.mood as PebbleMood, 3000);
      }

      // Log to activity
      addEntry(
        (response.agentName as 'CalmSense' | 'PebbleVoice' | 'SimplifyCore') || 'PebbleVoice',
        `Chat: ${response.intent} — "${text.slice(0, 50)}"`,
        `Routed to ${response.agentName}. Mood: ${response.mood}.`,
      );
    } catch (err) {
      const errorMsg: Message = {
        id: `e-${Date.now()}`,
        role: 'error',
        text: err instanceof Error ? err.message : 'Something went wrong. Pebble is taking a nap.',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, tasksCompleted, tasksTotal, recentTitles, preferences, timeOfDay, flashMood, addEntry]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      {/* Floating bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat with Pebble' : 'Chat with Pebble'}
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50,
          width: 56, height: 56, borderRadius: '50%',
          background: 'var(--pebble-color)', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: noMotion ? 'none' : 'transform 0.2s ease',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)',
        }}
      >
        {/* Pebble face */}
        <div style={{ position: 'relative', width: 28, height: 28 }}>
          <div style={{ position: 'absolute', width: 6, height: 6, background: '#2A2A2E', borderRadius: '50%', top: 8, left: 4 }} />
          <div style={{ position: 'absolute', width: 6, height: 6, background: '#2A2A2E', borderRadius: '50%', top: 8, right: 4 }} />
          <div style={{ position: 'absolute', width: 2, height: 2, background: 'white', borderRadius: '50%', top: 7, left: 5.5, opacity: 0.8 }} />
          <div style={{ position: 'absolute', width: 2, height: 2, background: 'white', borderRadius: '50%', top: 7, right: 5.5, opacity: 0.8 }} />
          {!isOpen && (
            <div style={{ position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50)', width: 8, height: 4, borderRadius: '0 0 4px 4px', background: '#2A2A2E' }} />
          )}
        </div>
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat with Pebble"
          style={{
            position: 'fixed', bottom: 90, right: 24, zIndex: 50,
            width: 380, maxHeight: 520,
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
                {calm ? 'Chat with Pebble' : 'Chat with Pebble'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                Ask me anything, or tell me how you feel
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
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
                {calm ? 'Hi there. I\'m Pebble.' : 'Hi there. I\'m Pebble.'}
                <br />
                Try: &quot;Help me break down writing my essay&quot;
                <br />
                or: &quot;I need some encouragement&quot;
              </div>
            )}

            {messages.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
              }}>
                {/* Agent badge */}
                {msg.agentName && (
                  <div style={{
                    fontSize: 10, fontWeight: 600, marginBottom: 4,
                    color: AGENT_COLORS[msg.agentName] || 'var(--text-muted)',
                  }}>
                    {msg.agentName}
                  </div>
                )}

                <div style={{
                  padding: '10px 14px', borderRadius: 14,
                  fontFamily: 'var(--font-nunito)', fontSize: 13, lineHeight: 1.5,
                  ...(msg.role === 'user' ? {
                    background: 'rgba(196,181,212,0.15)',
                    color: 'var(--text-primary)',
                    borderBottomRightRadius: 4,
                  } : msg.role === 'error' ? {
                    background: 'rgba(232,133,106,0.1)',
                    color: 'var(--accent-coral)',
                    border: '1px solid rgba(232,133,106,0.2)',
                  } : {
                    background: 'var(--bg-surface)',
                    color: 'var(--text-primary)',
                    borderBottomLeftRadius: 4,
                    ...(msg.intent === 'distress' ? {
                      borderLeft: '3px solid var(--accent-sage)',
                      background: 'rgba(143,175,138,0.08)',
                    } : {}),
                  }),
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div style={{
                alignSelf: 'flex-start', padding: '10px 14px',
                background: 'var(--bg-surface)', borderRadius: 14, borderBottomLeftRadius: 4,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--pebble-color)', position: 'relative',
                }}>
                  <div style={{ position: 'absolute', width: 3, height: 3, background: '#2A2A2E', borderRadius: '50%', top: 7, left: 4 }} />
                  <div style={{ position: 'absolute', width: 3, height: 3, background: '#2A2A2E', borderRadius: '50%', top: 7, right: 4 }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Pebble is thinking...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid rgba(255,248,235,0.06)',
            display: 'flex', gap: 8,
          }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Talk to Pebble..."
              aria-label="Message to Pebble"
              style={{
                flex: 1, padding: '10px 14px', borderRadius: 12,
                border: '1px solid var(--border-soft)', background: 'var(--bg-surface)',
                color: 'var(--text-primary)', fontFamily: 'var(--font-nunito)', fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label="Send message"
              style={{
                width: 40, height: 40, borderRadius: 12, border: 'none',
                background: input.trim() && !isLoading ? 'var(--accent-lavender)' : 'var(--border-soft)',
                color: input.trim() && !isLoading ? '#1a1a2e' : 'var(--text-muted)',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontWeight: 700, fontSize: 16,
                transition: noMotion ? 'none' : 'background 0.15s ease',
              }}
            >
              &uarr;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
