import type { ReactElement, ReactNode } from 'react';
import { render, renderHook, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PreferencesProvider } from '@/shared/preferences';
import { QueryProvider } from '@/shared/lib/query';
import { PebbleProvider } from '@/features/companion';
import { TasksProvider } from '@/features/tasks';
import { ActivityLogProvider } from '@/features/activity';
import { ToastProvider } from '@/shared/ui/ToastContext';

// The same provider tree as app/(app)/_shell/AppShell, without the layout around it.
// Each render gets its own query cache (no retries), so it loads from the MSW fakes afresh.
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider retry={false}>
      <PreferencesProvider>
        <PebbleProvider>
          <TasksProvider>
            <ActivityLogProvider>
              <ToastProvider>{children}</ToastProvider>
            </ActivityLogProvider>
          </TasksProvider>
        </PebbleProvider>
      </PreferencesProvider>
    </QueryProvider>
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
