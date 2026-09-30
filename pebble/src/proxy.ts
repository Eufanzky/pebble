import { NextResponse } from 'next/server';
import { auth } from '@/features/auth/server';

// Pages need a signed-in user; anyone else goes to /signin and comes back after.
// API calls check the session themselves (app/api/[...path]/route.ts).
export default auth((request) => {
  if (request.auth?.user) return;
  const signIn = new URL('/signin', request.nextUrl);
  signIn.searchParams.set('callbackUrl', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(signIn);
});

export const config = {
  // Everything except the API, the sign-in page, Next's own files and static files (anything with a dot).
  matcher: ['/((?!api/|signin|_next/|.*\\..*).*)'],
};
