import { signBackendToken } from './backendToken';

/** Request headers the backend needs; everything else (cookies included) stays here. */
const REQUEST_HEADERS = ['accept', 'content-type'];
/** Response headers the browser needs. */
const RESPONSE_HEADERS = ['content-type', 'retry-after'];

export const UNREACHABLE = "Pebble couldn't answer just now. Try again in a little while.";

interface ForwardOptions {
  userId: string;
  backendUrl: string;
  secret: string;
  fetchImpl?: typeof fetch;
  now?: Date;
}

function detail(status: number, message: string): Response {
  return Response.json({ detail: message }, { status });
}

/**
 * Sends an `/api/*` request on to the backend as the signed-in user: same
 * method, path, query and body, plus a fresh access token. A backend that
 * can't be reached is a gentle 503, like any other outage.
 */
export async function forwardToBackend(request: Request, path: string[], options: ForwardOptions): Promise<Response> {
  const { userId, backendUrl, secret, fetchImpl = fetch, now } = options;
  const target = new URL(`/api/${path.map(encodeURIComponent).join('/')}`, backendUrl);
  target.search = new URL(request.url).search;

  const headers = new Headers();
  for (const name of REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set('authorization', `Bearer ${await signBackendToken(userId, secret, now)}`);

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  let response: Response;
  try {
    response = await fetchImpl(target, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: 'manual',
      cache: 'no-store',
    });
  } catch {
    return detail(503, UNREACHABLE);
  }

  const out = new Headers();
  for (const name of RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) out.set(name, value);
  }
  return new Response(response.body, { status: response.status, headers: out });
}

export { detail as errorResponse };
