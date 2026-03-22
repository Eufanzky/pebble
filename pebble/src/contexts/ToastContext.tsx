'use client';

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { usePreferences } from './PreferencesContext';

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastDisplay({ message, onDone }: { message: string; onDone: () => void }) {
  const { preferences } = usePreferences();
  const noMotion = preferences.reduceAnimations;
  const [phase, setPhase] = useState<'enter' | 'visible' | 'exit'>('enter');

  useEffect(() => {
    if (noMotion) setPhase('visible');
    else {
      const t = setTimeout(() => setPhase('visible'), 20);
      return () => clearTimeout(t);
    }
  }, [noMotion]);

  useEffect(() => {
    const t = setTimeout(() => setPhase('exit'), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'exit') {
      const t = setTimeout(onDone, noMotion ? 0 : 300);
      return () => clearTimeout(t);
    }
  }, [phase, onDone, noMotion]);

  return (
    <div
      style={{
        position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, maxWidth: 400,
        background: 'rgba(212,168,67,0.15)',
        border: '1px solid rgba(212,168,67,0.30)',
        borderRadius: 12, padding: '12px 20px',
        fontFamily: 'var(--font-nunito)', fontSize: 14, color: 'var(--accent-amber)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        opacity: phase === 'visible' ? 1 : 0,
        marginBottom: phase === 'enter' ? -20 : 0,
        transition: noMotion ? 'none' : 'opacity 0.3s ease-out, margin-bottom 0.3s ease-out',
      }}
    >
      {message}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setCurrent(message);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {current && <ToastDisplay message={current} onDone={() => setCurrent(null)} />}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
