'use client';

import { useState } from 'react';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useChat } from '../hooks/useChat';
import ChatLauncher from './ChatLauncher';
import ChatPanel from './ChatPanel';

/** The chat with Pebble, available on every page. */
export default function PebbleChat() {
  const { preferences, stripEmoji } = usePreferences();
  const { messages, isLoading, send } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const noMotion = preferences.reduceAnimations;

  return (
    <>
      <ChatLauncher isOpen={isOpen} noMotion={noMotion} onToggle={() => setIsOpen(!isOpen)} />
      {isOpen && (
        <ChatPanel
          messages={messages}
          isLoading={isLoading}
          onSend={send}
          onClose={() => setIsOpen(false)}
          noMotion={noMotion}
          stripEmoji={stripEmoji}
        />
      )}
    </>
  );
}
