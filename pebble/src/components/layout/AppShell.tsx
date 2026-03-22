'use client';

import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import ScreenBackground from './ScreenBackground';
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

function AppShellInner({ children }: { children: ReactNode }) {
  return (
    <>
      <CSSVariableInjector />
      <div className="flex h-screen w-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative">
          <ScreenBackground />
          <div className="relative z-[1] p-10 px-12">
            {children}
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
