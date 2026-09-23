'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { PebbleProvider } from '@/contexts/PebbleContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { ActivityLogProvider } from '@/contexts/ActivityLogContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { useFocusOnNavigation } from '@/hooks/useFocusOnNavigation';
import PebbleChat from '@/components/chat/PebbleChat';

function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // The page currently on screen. On navigation it stays up while fading out.
  const [shown, setShown] = useState({ pathname, children });
  const navigating = pathname !== shown.pathname;

  // Same page re-rendered: keep the shown children current
  if (!navigating && shown.children !== children) {
    setShown({ pathname, children });
  }

  useEffect(() => {
    if (!navigating) return;
    const timeout = setTimeout(() => setShown({ pathname, children }), 200);
    return () => clearTimeout(timeout);
  }, [navigating, pathname, children]);

  return (
    <div
      className="page-transition"
      style={{
        opacity: navigating ? 0 : 1,
        transform: navigating ? 'translateY(8px)' : 'none',
      }}
    >
      {shown.children}
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
      <PebbleChat />
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
