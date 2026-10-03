'use client';

import { useState, type FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import { PebbleCharacter } from '@/features/companion';
import { PreferencesProvider } from '@/shared/preferences';
import { QueryProvider } from '@/shared/lib/query';
import { AmbientBackground } from '@/shared/ui';
import type { ProviderId } from '../lib/providers';
import './SignInView.css';

const OAUTH: { id: Exclude<ProviderId, 'dev'>; label: string }[] = [
  { id: 'github', label: 'Continue with GitHub' },
  { id: 'google', label: 'Continue with Google' },
];

interface SignInViewProps {
  providers: ProviderId[];
  callbackUrl: string;
  /** Set when Auth.js sent the user back after a failed sign-in. */
  error?: boolean;
}

/** The sign-in page: the ways this deployment offers, and Pebble waking up as you pick one. */
export function SignInView(props: SignInViewProps) {
  return (
    <QueryProvider>
      {/* Nobody is signed in yet: this device's copy of the preferences only */}
      <PreferencesProvider offline>
        <AmbientBackground mood="welcome" />
        <SignInPanel {...props} />
      </PreferencesProvider>
    </QueryProvider>
  );
}

function SignInPanel({ providers, callbackUrl, error = false }: SignInViewProps) {
  const [awake, setAwake] = useState(false);
  const [devName, setDevName] = useState('dev');
  const [busy, setBusy] = useState(false);
  // Pebble wakes up while a way to sign in is hovered or focused.
  const wake = {
    onPointerEnter: () => setAwake(true),
    onPointerLeave: () => setAwake(false),
    onFocus: () => setAwake(true),
    onBlur: () => setAwake(false),
  };

  const oauth = OAUTH.filter((p) => providers.includes(p.id));
  const devLogin = providers.includes('dev');

  const start = (id: ProviderId, options: Record<string, string> = {}) => {
    setBusy(true);
    void signIn(id, { ...options, redirectTo: callbackUrl });
  };

  const submitDev = (event: FormEvent) => {
    event.preventDefault();
    start('dev', { name: devName });
  };

  return (
    <main className="signin" id="main-content">
      <div className="signin-pebble" aria-hidden="true">
        <PebbleCharacter mood={awake || busy ? 'normal' : 'sleepy'} size="large" />
      </div>

      <div className="signin-panel">
        <h1 className="signin-title">Pebble is here when you&apos;re ready.</h1>
        <p className="signin-lead">Sign in to keep your list, your settings and your activity with you.</p>

        {error && (
          <p className="signin-note" role="alert">
            Sign-in didn&apos;t finish. Try again, or pick another way.
          </p>
        )}

        {oauth.length > 0 && (
          <div className="signin-options">
            {oauth.map((p) => (
              <button
                key={p.id}
                type="button"
                className="signin-button"
                disabled={busy}
                onClick={() => start(p.id)}
                {...wake}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {devLogin && (
          <form className="signin-dev" onSubmit={submitDev} aria-labelledby="signin-dev-title">
            <h2 id="signin-dev-title" className="signin-dev-title">Dev login</h2>
            <p className="signin-dev-note">
              On because <code>AUTH_DEV_LOGIN=true</code>. Only for your own computer and the tests.
            </p>
            <label className="signin-dev-label" htmlFor="signin-dev-name">Name</label>
            <div className="signin-dev-row">
              <input
                id="signin-dev-name"
                className="signin-dev-input"
                value={devName}
                onChange={(e) => setDevName(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" className="signin-button" disabled={busy} {...wake}>
                Sign in as {devName.trim() || 'dev'}
              </button>
            </div>
          </form>
        )}

        {providers.length === 0 && (
          <p className="signin-note">
            Sign-in isn&apos;t set up here yet. Add a GitHub or Google app, or turn on the dev login. The README
            shows how.
          </p>
        )}
      </div>
    </main>
  );
}
