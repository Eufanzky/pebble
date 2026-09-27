'use client';

import { useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { useChat } from '../hooks/useChat';
import ChatLauncher from './ChatLauncher';
import ChatPanel from './ChatPanel';

/** The chat with Pebble, available on every page. */
export default function PebbleChat() {
  const { reduceMotion, stripEmoji } = usePreferences();
  const { messages, isLoading, send } = useChat();
  const [isOpen, setIsOpen] = useState(false);
  const noMotion = reduceMotion;

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
