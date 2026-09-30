import type { ReactNode } from 'react';
import AppShell from './_shell/AppShell';

/** Every page of the app, behind sign-in (see src/proxy.ts). The sign-in page has no shell. */
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
