'use client';

import './PebbleMoods.css';

interface PebbleSpeechBubbleProps {
  message: string;
  className?: string;
}

export default function PebbleSpeechBubble({ message, className = '' }: PebbleSpeechBubbleProps) {
  return (
    <div className={`relative text-center max-w-[220px] ${className}`}>
      <div
        // Remount on a new message so the bubble animation replays
        key={message}
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
        {message}
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
