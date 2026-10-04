import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import type { Provider } from 'next-auth/providers';
import { devUserName, enabledProviders, userIdFor } from './lib/providers';

declare module 'next-auth' {
  interface Session {
    user: { id: string } & DefaultSession['user'];
  }
}

function buildProviders(): Provider[] {
  return enabledProviders().map((id) => {
    if (id === 'github') return GitHub;
    if (id === 'google') return Google;
    return Credentials({
      id: 'dev',
      name: 'Dev login',
      credentials: { name: { label: 'Name' } },
      authorize: (credentials) => {
        const name = devUserName(credentials?.name);
        return { id: name, name };
      },
    });
  });
}

/** Auth.js: GitHub and Google sign-in (plus the dev login when enabled), in a JWT session cookie. */
export const { handlers, auth } = NextAuth({
  providers: buildProviders(),
  session: { strategy: 'jwt' },
  pages: { signIn: '/signin', error: '/signin' },
  callbacks: {
    jwt({ token, account }) {
      if (account) token.uid = userIdFor(account.provider, account.providerAccountId);
      return token;
    },
    session({ session, token }) {
      if (typeof token.uid === 'string') session.user.id = token.uid;
      return session;
    },
  },
});
