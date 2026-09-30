import { auth, errorResponse, forwardToBackend } from '@/features/auth/server';

// Every /api/* call except Auth.js's own goes to the backend, signed as the
// current user. BACKEND_URL is where the backend runs (http://localhost:8000
// locally); AUTH_TOKEN_SECRET is shared with it.
async function handle(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const session = await auth();
  if (!session?.user?.id) return errorResponse(401, 'Please sign in first.');
  const secret = process.env.AUTH_TOKEN_SECRET;
  if (!secret) return errorResponse(503, "Sign-in isn't set up yet.");
  return forwardToBackend(request, (await params).path, {
    userId: session.user.id,
    backendUrl: process.env.BACKEND_URL || 'http://localhost:8000',
    secret,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
