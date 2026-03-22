'use client';

import { usePebble } from '@/contexts/PebbleContext';

export default function PebbleSpeechBubble() {
  const { currentMessage } = usePebble();

  return (
    <div className="relative text-center max-w-[210px] mb-3.5">
      <div
        className="rounded-[14px] px-3.5 py-2.5 text-[12.5px] leading-relaxed"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-baloo)',
        }}
      >
        {currentMessage || "Let's take it one step at a time."}
      </div>
      <div
        className="absolute left-1/2 -translate-x-1/2 -bottom-[7px] w-0 h-0"
        style={{
          borderLeft: '7px solid transparent',
          borderRight: '7px solid transparent',
          borderTop: '7px solid var(--glass-bg)',
        }}
      />
    </div>
  );
}
