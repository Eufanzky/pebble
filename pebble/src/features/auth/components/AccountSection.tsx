'use client';

import { signOut } from 'next-auth/react';

const VIA: Record<string, string> = { github: 'GitHub', google: 'Google', dev: 'the dev login' };

interface AccountSectionProps {
  name: string;
  /** The user id the backend sees, `provider:account`. */
  userId: string;
}

/** Who is signed in, and the way out. */
export function AccountSection({ name, userId }: AccountSectionProps) {
  const provider = userId.split(':')[0];
  return (
    <section aria-labelledby="account-title" className="glass-card mt-8" style={{ padding: '18px 20px' }}>
      <h2
        id="account-title"
        style={{ fontFamily: 'var(--font-baloo)', fontSize: 18, color: 'var(--text-primary)', fontWeight: 700 }}
      >
        Your account
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Signed in as {name} with {VIA[provider] ?? provider}.
      </p>
      <button
        type="button"
        onClick={() => void signOut({ redirectTo: '/signin' })}
        className="mt-4 px-5 py-2 rounded-full text-sm font-semibold"
        style={{ border: '1px solid var(--pebble-color)', color: 'var(--text-primary)' }}
      >
        Sign out
      </button>
    </section>
  );
}
