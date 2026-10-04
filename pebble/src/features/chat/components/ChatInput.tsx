import type { KeyboardEvent, RefObject } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
  noMotion: boolean;
  inputRef: RefObject<HTMLInputElement | null>;
}

export default function ChatInput({ value, onChange, onSend, disabled, noMotion, inputRef }: ChatInputProps) {
  const canSend = value.trim() !== '' && !disabled;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div style={{
      padding: '12px 14px', borderTop: '1px solid rgba(255,248,235,0.06)',
      display: 'flex', gap: 8,
    }}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Talk to Pebble..."
        aria-label="Message to Pebble"
        style={{
          flex: 1, padding: '10px 14px', borderRadius: 12,
          border: '1px solid var(--color-line)', background: 'var(--color-surface-2)',
          color: 'var(--color-text)', fontFamily: 'var(--font-nunito)', fontSize: 13,
          outline: 'none',
        }}
      />
      <button
        onClick={onSend}
        disabled={!canSend}
        aria-label="Send message"
        style={{
          width: 40, height: 40, borderRadius: 12, border: 'none',
          background: canSend ? 'var(--color-accent)' : 'var(--color-line)',
          color: canSend ? '#1a1a2e' : 'var(--color-text-3)',
          cursor: canSend ? 'pointer' : 'not-allowed',
          fontWeight: 700, fontSize: 16,
          transition: noMotion ? 'none' : 'background 0.15s ease',
        }}
      >
        &uarr;
      </button>
    </div>
  );
}
