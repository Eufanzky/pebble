/**
 * The HTTP client for the Pebble backend.
 * Paths are relative (`/api/...`): Next.js rewrites them to the backend, so
 * the browser never calls another origin.
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

async function request<Response>(path: string, init?: RequestInit): Promise<Response> {
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

  return res.json() as Promise<Response>;
}

/** GETs `path` and returns the parsed JSON reply. Throws `ApiError`. */
export function getJson<Response>(path: string): Promise<Response> {
  return request<Response>(path);
}

/** POSTs `body` as JSON and returns the parsed JSON reply. Throws `ApiError`. */
export function postJson<Response>(path: string, body: unknown): Promise<Response> {
  return request<Response>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
