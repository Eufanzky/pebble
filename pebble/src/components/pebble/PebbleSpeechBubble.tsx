'use client';

import { useRef, useEffect, useState } from 'react';
import './PebbleMoods.css';

interface PebbleSpeechBubbleProps {
  message: string;
  className?: string;
}

export default function PebbleSpeechBubble({ message, className = '' }: PebbleSpeechBubbleProps) {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [animKey, setAnimKey] = useState(0);
  const prevMessage = useRef(message);

  useEffect(() => {
    if (message !== prevMessage.current) {
      prevMessage.current = message;
      setAnimKey((k) => k + 1);
      setDisplayMessage(message);
    }
  }, [message]);

  return (
    <div className={`relative text-center max-w-[220px] ${className}`}>
      <div
        key={animKey}
        className="pebble-speech-bubble rounded-[14px] px-4 py-2.5"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-baloo)',
          fontSize: '12.5px',
          lineHeight: 1.55,
        }}
      >
        {displayMessage}
      </div>
      {/* Triangle pointer pointing up */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          bottom: -6,
          width: 0,
          height: 0,
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid var(--glass-bg)',
        }}
      />
    </div>
  );
}
