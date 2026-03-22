'use client';

import { type ReactNode, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { PreferencesProvider, usePreferences } from '@/contexts/PreferencesContext';
import { PebbleProvider } from '@/contexts/PebbleContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { ActivityLogProvider } from '@/contexts/ActivityLogContext';

function CSSVariableInjector() {
  const { preferences } = usePreferences();

  return (
    <style>{`
      :root {
        --pebble-color: ${preferences.pebbleColor};
        --pebble-dark: ${preferences.pebbleDark};
      }
    `}</style>
  );
}

function ReduceAnimationsInjector() {
  const { preferences } = usePreferences();

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-animations', preferences.reduceAnimations);
  }, [preferences.reduceAnimations]);

  return null;
}

function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setPhase('out');

      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setPhase('in');
      }, 200);

      return () => clearTimeout(timeout);
    } else {
      setDisplayChildren(children);
    }
  }, [pathname, children]);

  return (
    <div
      className="page-transition"
      style={{
        opacity: phase === 'out' ? 0 : 1,
        transform: phase === 'out' ? 'translateY(8px)' : 'translateY(0)',
      }}
    >
      {displayChildren}
    </div>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  return (
    <>
      <CSSVariableInjector />
      <ReduceAnimationsInjector />
      <div className="app-layout">
        <Sidebar />
        <main className="main-content">
          <div className="main-content-inner">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
    </>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <PebbleProvider>
        <TasksProvider>
          <ActivityLogProvider>
            <AppShellInner>{children}</AppShellInner>
          </ActivityLogProvider>
        </TasksProvider>
      </PebbleProvider>
    </PreferencesProvider>
  );
}
