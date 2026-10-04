import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInView } from '@/features/auth';
import { auth, enabledProviders, safeCallbackUrl } from '@/features/auth/server';

export const metadata: Metadata = { title: 'Sign in — pebble' };

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl, error } = await searchParams;
  const target = safeCallbackUrl(callbackUrl);
  if ((await auth())?.user) redirect(target);

  return <SignInView providers={enabledProviders()} callbackUrl={target} error={Boolean(error)} />;
}
