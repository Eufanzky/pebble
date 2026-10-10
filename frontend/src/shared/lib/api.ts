/**
 * The HTTP client for the Pebble backend.
 * Paths are relative (`/api/...`): the Next.js server forwards them to the
 * backend as the signed-in user, so the browser never calls another origin.
 */

/** A request the backend answered with an error status, or never answered. */
export class ApiError extends Error {
  constructor(
    readonly status: number | null,
    readonly detail: string,
  ) {
    super(status === null ? `Request failed: ${detail}` : `Request failed (${status}): ${detail}`);
    this.name = 'ApiError';
  }
}

/** What Pebble says while the agents can't be asked: the backend's own words for both limits (10.4). */
export const RESTING_TEXT = 'Pebble is resting for a moment. Try again in a little while.';

/**
 * The agents are resting: this account made many calls in a short time (429), or the AI provider's shared
 * limit was reached (a 503 in the same words). Either way, it isn't the user's mistake, and it passes.
 */
export function isResting(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 429) return true;
  if (error.status !== 503) return false;
  try {
    return (JSON.parse(error.detail) as { detail?: unknown }).detail === RESTING_TEXT;
  } catch {
    return false;
  }
}

/** The response, if it's a success. Throws `ApiError` otherwise, or when the request can't be made. */
async function fetchOk(path: string, init?: RequestInit): Promise<globalThis.Response> {
  let res: globalThis.Response;
  try {
    res = await fetch(path, init);
  } catch (error) {
    throw new ApiError(null, error instanceof Error ? error.message : String(error));
  }

  if (!res.ok) {
    const detail = await res.text().catch(() => 'Unknown error');
    throw new ApiError(res.status, detail);
  }
  return res;
}

async function request<Response>(path: string, init?: RequestInit): Promise<Response> {
  const res = await fetchOk(path, init);
  if (res.status === 204) return undefined as Response;
  return res.json() as Promise<Response>;
}

/** GETs `path` as a file (a calendar file, for one). Throws `ApiError`. */
export async function getBlob(path: string): Promise<Blob> {
  return (await fetchOk(path)).blob();
}

function sendJson<Response>(method: string, path: string, body: unknown): Promise<Response> {
  return request<Response>(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** GETs `path` and returns the parsed JSON reply. Throws `ApiError`. */
export function getJson<Response>(path: string): Promise<Response> {
  return request<Response>(path);
}

/** POSTs `body` as JSON and returns the parsed JSON reply. Throws `ApiError`. */
export function postJson<Response>(path: string, body: unknown): Promise<Response> {
  return sendJson<Response>('POST', path, body);
}

/** PATCHes `body` as JSON (only the fields to change). Throws `ApiError`. */
export function patchJson<Response>(path: string, body: unknown): Promise<Response> {
  return sendJson<Response>('PATCH', path, body);
}

/** PUTs `body` as JSON. Throws `ApiError`. */
export function putJson<Response>(path: string, body: unknown): Promise<Response> {
  return sendJson<Response>('PUT', path, body);
}

/** DELETEs `path`; the backend answers 204. Throws `ApiError`. */
export function deleteRequest(path: string): Promise<void> {
  return request<void>(path, { method: 'DELETE' });
}

/** POSTs `form` as multipart form data (file uploads). Throws `ApiError`. */
export function postForm<Response>(path: string, form: FormData): Promise<Response> {
  return request<Response>(path, { method: 'POST', body: form });
}
