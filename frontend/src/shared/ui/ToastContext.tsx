'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { usePreferences } from '@/shared/preferences';

/** A button on the toast, such as "Undo" after an AI change (7.5). */
export interface ToastAction {
  label: string;
  onAction: () => void;
}

interface ToastContextValue {
  showToast: (message: string, action?: ToastAction) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastDisplay({ message, action, onDone }: { message: string; action?: ToastAction; onDone: () => void }) {
  const { reduceMotion } = usePreferences();
  const noMotion = reduceMotion;
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>(() => (noMotion ? 'visible' : 'enter'));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Longer with a button, so there's time to reach it; hovering or focusing it pauses the timer
  const remainingRef = useRef(action ? 10000 : 5000);
  const startTimeRef = useRef(0); // set by startTimer before it is read

  useEffect(() => {
    if (noMotion) return;
    const t = setTimeout(() => setPhase('visible'), 20);
    return () => clearTimeout(t);
  }, [noMotion]);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => setPhase('exit'), remainingRef.current);
  }, []);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startTimeRef.current;
      if (remainingRef.current < 0) remainingRef.current = 0;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  useEffect(() => {
    if (phase === 'exit') {
      const t = setTimeout(onDone, noMotion ? 0 : 300);
      return () => clearTimeout(t);
    }
  }, [phase, onDone, noMotion]);

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocus={pauseTimer}
      onBlur={startTimer}
      style={{
        position: 'fixed', bottom: 'calc(24px + var(--app-bottom-inset, 0px))', left: '50%', transform: 'translateX(-50%)',
        display: 'flex', alignItems: 'center', gap: 12,
        // Never in the way: only its button takes clicks, so whatever is under the toast stays usable
        pointerEvents: 'none',
        zIndex: 100, maxWidth: 400,
        background: 'rgba(212,168,67,0.15)',
        border: '1px solid rgba(212,168,67,0.30)',
        borderRadius: 12, padding: '12px 20px',
        fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--color-tag-communication)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        opacity: phase === 'visible' ? 1 : 0,
        marginBottom: phase === 'enter' ? -20 : 0,
        transition: noMotion ? 'none' : 'opacity 0.3s ease-out, margin-bottom 0.3s ease-out',
      }}
    >
      <span>{message}</span>
      {action && (
        <button
          type="button"
          className="ui-toast__action"
          // The toast lets clicks through; its button takes them
          style={{ pointerEvents: 'auto' }}
          onClick={() => {
            action.onAction();
            setPhase('exit');
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<{ id: number; message: string; action?: ToastAction } | null>(null);
  const nextId = useRef(0);

  const showToast = useCallback((message: string, action?: ToastAction) => {
    // A new id remounts the toast, so a second one restarts its timer
    setCurrent({ id: nextId.current++, message, action });
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {current && (
        <ToastDisplay key={current.id} message={current.message} action={current.action} onDone={() => setCurrent(null)} />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
