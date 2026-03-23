'use client';

import { type ReactNode, useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { PebbleProvider } from '@/contexts/PebbleContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { ActivityLogProvider } from '@/contexts/ActivityLogContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useFocusOnNavigation } from '@/hooks/useFocusOnNavigation';

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
        transform: phase === 'out' ? 'translateY(8px)' : 'none',
      }}
    >
      {displayChildren}
    </div>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  useFocusOnNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <button
        className="mobile-menu-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={sidebarOpen}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <line x1="3" y1="5" x2="17" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="10" x2="17" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="3" y1="15" x2="17" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <div
        className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />
      <Sidebar className={sidebarOpen ? 'sidebar-open' : ''} onNavClick={() => setSidebarOpen(false)} />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="main-content-inner">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <PebbleProvider>
        <TasksProvider>
          <ActivityLogProvider>
            <ToastProvider>
              <AppShellInner>{children}</AppShellInner>
            </ToastProvider>
          </ActivityLogProvider>
        </TasksProvider>
      </PebbleProvider>
    </PreferencesProvider>
  );
}
