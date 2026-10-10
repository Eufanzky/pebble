'use client';

import { type ReactNode, useEffect, useState } from 'react';
import { usePreferences } from '@/shared/preferences';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import './shell.css';
import { useImportLocalData } from './useImportLocalData';
import { useServiceWorker } from './useServiceWorker';
import { PreferencesProvider } from '@/shared/preferences';
import { QueryProvider } from '@/shared/lib/query';
import { PebbleProvider } from '@/features/companion';
import { TasksProvider } from '@/features/tasks';
import { ActivityLogProvider } from '@/features/activity';
import { ToastProvider } from '@/shared/ui/ToastContext';
import { useFocusOnNavigation } from '@/shared/hooks/useFocusOnNavigation';
import { PebbleChat } from '@/features/chat';
import { Reminders } from '@/features/reminders';

/** The old page fades out and the new one settles in; with reduced motion the new page shows at once. */
function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { reduceMotion } = usePreferences();
  // The page currently on screen. On navigation it stays up while fading out.
  const [shown, setShown] = useState({ pathname, children });
  const navigating = pathname !== shown.pathname;

  // Same page re-rendered, or no motion wanted: show the current children now
  if ((!navigating || reduceMotion) && shown.children !== children) {
    setShown({ pathname, children });
  }

  useEffect(() => {
    if (!navigating) return;
    const timeout = setTimeout(() => setShown({ pathname, children }), 200);
    return () => clearTimeout(timeout);
  }, [navigating, pathname, children]);

  return (
    <div className="page-transition" data-leaving={(navigating && !reduceMotion) || undefined}>
      {shown.children}
    </div>
  );
}

function AppShellInner({ children }: { children: ReactNode }) {
  useFocusOnNavigation();
  useImportLocalData();
  useServiceWorker();

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Sidebar />
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="main-content-inner">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <PebbleChat />
      <Reminders />
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
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
    </QueryProvider>
  );
}
