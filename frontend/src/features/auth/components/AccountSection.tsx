'use client';

import { signOut } from 'next-auth/react';
import { useAccountData } from '../hooks/useAccountData';

const VIA: Record<string, string> = { github: 'GitHub', google: 'Google', dev: 'the dev login' };

const headingStyle = { fontFamily: 'var(--font-baloo)', fontSize: 18, color: 'var(--color-text)', fontWeight: 700 };
const textStyle = { color: 'var(--color-text-2)' };
const buttonClass = 'px-5 py-2 rounded-full text-sm font-semibold';
const buttonStyle = { border: '1px solid var(--pebble-color)', color: 'var(--color-text)' };

interface AccountSectionProps {
  name: string;
  /** The user id the backend sees, `provider:account`. */
  userId: string;
}

/** Who is signed in, the way out, and the user's data: download it all, or delete it all. */
export function AccountSection({ name, userId }: AccountSectionProps) {
  const provider = userId.split(':')[0];
  const { busy, error, download, deleteAccount } = useAccountData();

  return (
    <section aria-labelledby="account-title" className="ui-card mt-8" style={{ padding: '18px 20px' }}>
      <h2 id="account-title" style={headingStyle}>
        Your account
      </h2>
      <p className="mt-1 text-sm" style={textStyle}>
        Signed in as {name} with {VIA[provider] ?? provider}.
      </p>
      <button
        type="button"
        onClick={() => void signOut({ redirectTo: '/signin' })}
        className={`mt-4 ${buttonClass}`}
        style={buttonStyle}
      >
        Sign out
      </button>

      <h3 className="mt-6" style={{ ...headingStyle, fontSize: 16 }}>
        Your data
      </h3>
      <p className="mt-1 text-sm" style={textStyle}>
        Everything Pebble keeps about you: your tasks, settings and activity log. Documents you open are never
        stored.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void download()}
          disabled={busy !== null}
          aria-busy={busy === 'export'}
          className={buttonClass}
          style={buttonStyle}
        >
          {busy === 'export' ? 'Getting your data…' : 'Download my data'}
        </button>
        <button
          type="button"
          onClick={() => void deleteAccount()}
          disabled={busy !== null}
          aria-busy={busy === 'delete'}
          className={buttonClass}
          style={{ ...buttonStyle, borderColor: 'var(--color-line)' }}
        >
          {busy === 'delete' ? 'Deleting…' : 'Delete my account'}
        </button>
      </div>
      {error && (
        <p role="status" className="mt-3 text-sm" style={textStyle}>
          {error}
        </p>
      )}
    </section>
  );
}
