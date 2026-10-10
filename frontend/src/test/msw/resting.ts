import { http, HttpResponse } from 'msw';

/** The backend's words for both limits (`RESTING` in `backend/app/api/errors.py`; 10.4). */
const RESTING = 'Pebble is resting for a moment. Try again in a little while.';

/**
 * The agents resting (10.4): `limit` is this account's own limit (429), `provider` the AI provider's shared
 * one (503), both in the same words and with `Retry-After`.
 */
export function resting(path: string, kind: 'limit' | 'provider') {
  return http.post(path, () =>
    HttpResponse.json(
      { detail: RESTING },
      { status: kind === 'limit' ? 429 : 503, headers: { 'Retry-After': kind === 'limit' ? '60' : '30' } },
    ),
  );
}
