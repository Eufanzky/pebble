// @vitest-environment node
import { jwtVerify } from 'jose';
import { describe, expect, it, vi } from 'vitest';
import { forwardToBackend, UNREACHABLE } from './forward';

const SECRET = 'a-shared-secret-that-is-32-bytes-long';
const OPTIONS = { userId: 'google:7', backendUrl: 'http://backend:8000', secret: SECRET };

function capture(response: Response = Response.json({ ok: true })) {
  const calls: { url: string; init: RequestInit }[] = [];
  const fetchImpl = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), init: init ?? {} });
    return response;
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
}

describe('forwardToBackend', () => {
  it('sends the method, path, query and body on, with a token for the user', async () => {
    const { calls, fetchImpl } = capture();
    const request = new Request('http://app/api/tasks/abc?limit=5', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', cookie: 'authjs.session-token=secret' },
      body: JSON.stringify({ completed: true }),
    });

    await forwardToBackend(request, ['tasks', 'abc'], { ...OPTIONS, fetchImpl });

    const [{ url, init }] = calls;
    expect(url).toBe('http://backend:8000/api/tasks/abc?limit=5');
    expect(init.method).toBe('PATCH');
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe('{"completed":true}');
    const headers = new Headers(init.headers);
    expect(headers.get('content-type')).toBe('application/json');
    expect(headers.get('cookie')).toBeNull();
    const token = headers.get('authorization')!.replace('Bearer ', '');
    const { payload } = await jwtVerify(token, new TextEncoder().encode(SECRET));
    expect(payload.sub).toBe('google:7');
  });

  it('sends no body with a GET', async () => {
    const { calls, fetchImpl } = capture();

    await forwardToBackend(new Request('http://app/api/tasks'), ['tasks'], { ...OPTIONS, fetchImpl });

    expect(calls[0].init.body).toBeUndefined();
  });

  it('encodes each path segment', async () => {
    const { calls, fetchImpl } = capture();

    await forwardToBackend(new Request('http://app/api/x'), ['tasks', '../admin'], { ...OPTIONS, fetchImpl });

    expect(calls[0].url).toBe('http://backend:8000/api/tasks/..%2Fadmin');
  });

  it('passes the status, body, content type and Retry-After back, and nothing else', async () => {
    const backend = new Response(JSON.stringify({ detail: 'Pebble is resting' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'retry-after': '30', 'set-cookie': 'x=1' },
    });
    const { fetchImpl } = capture(backend);

    const response = await forwardToBackend(new Request('http://app/api/agents/chat'), ['agents', 'chat'], {
      ...OPTIONS,
      fetchImpl,
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ detail: 'Pebble is resting' });
    expect(response.headers.get('retry-after')).toBe('30');
    expect(response.headers.get('set-cookie')).toBeNull();
  });

  it('passes an empty 204 back', async () => {
    const { fetchImpl } = capture(new Response(null, { status: 204 }));

    const response = await forwardToBackend(new Request('http://app/api/tasks', { method: 'DELETE' }), ['tasks'], {
      ...OPTIONS,
      fetchImpl,
    });

    expect(response.status).toBe(204);
  });

  it('turns an unreachable backend into a gentle 503', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new TypeError('fetch failed');
    }) as unknown as typeof fetch;

    const response = await forwardToBackend(new Request('http://app/api/tasks'), ['tasks'], { ...OPTIONS, fetchImpl });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ detail: UNREACHABLE });
  });
});
