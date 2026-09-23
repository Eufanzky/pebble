import type { ReactElement, ReactNode } from 'react';
import { render, renderHook, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { PebbleProvider } from '@/contexts/PebbleContext';
import { TasksProvider } from '@/contexts/TasksContext';
import { ActivityLogProvider } from '@/contexts/ActivityLogContext';
import { ToastProvider } from '@/contexts/ToastContext';

// The same provider tree as AppShell, without the layout around it.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PreferencesProvider>
      <PebbleProvider>
        <TasksProvider>
          <ActivityLogProvider>
            <ToastProvider>{children}</ToastProvider>
          </ActivityLogProvider>
        </TasksProvider>
      </PebbleProvider>
    </PreferencesProvider>
  );
}

// Renders `ui` inside the app providers and returns a user-event instance
// alongside the usual Testing Library queries.
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AppProviders, ...options }),
  };
}

export function renderHookWithProviders<Result>(hook: () => Result) {
  return renderHook(hook, { wrapper: AppProviders });
}

export * from '@testing-library/react';
export { userEvent };
