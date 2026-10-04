'use client';

import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/** Data from the backend: cached per session, refetched when the window regains focus. */
function makeQueryClient(options: { retry?: boolean } = {}) {
  return new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: options.retry === false ? false : 1 },
      mutations: { retry: false },
    },
  });
}

export function QueryProvider({ children, retry }: { children: ReactNode; retry?: boolean }) {
  const [client] = useState(() => makeQueryClient({ retry }));
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
