import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { server } from '@/test/msw/server';
import { ApiError, getJson, postForm, postJson } from './api';

describe('postJson', () => {
  it('sends the body as JSON and returns the parsed reply', async () => {
    let received: { contentType: string | null; body: unknown } | undefined;
    server.use(
      http.post('/api/echo', async ({ request }) => {
        received = { contentType: request.headers.get('Content-Type'), body: await request.json() };
        return HttpResponse.json({ ok: true });
      }),
    );

    await expect(postJson('/api/echo', { a: 1 })).resolves.toEqual({ ok: true });
    expect(received).toEqual({ contentType: 'application/json', body: { a: 1 } });
  });

  it('throws an ApiError with the status and detail on an error status', async () => {
    server.use(http.post('/api/echo', () => HttpResponse.json({ detail: 'nope' }, { status: 503 })));

    const error = await postJson('/api/echo', {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, detail: '{"detail":"nope"}' });
  });

  it('throws an ApiError without a status when the backend is unreachable', async () => {
    server.use(http.post('/api/echo', () => HttpResponse.error()));

    const error = await postJson('/api/echo', {}).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: null });
  });
});

describe('getJson', () => {
  it('returns the parsed reply', async () => {
    server.use(http.get('/api/thing', () => HttpResponse.json({ id: 1 })));

    await expect(getJson('/api/thing')).resolves.toEqual({ id: 1 });
  });

  it('throws an ApiError on an error status', async () => {
    server.use(http.get('/api/thing', () => new HttpResponse('down', { status: 503 })));

    await expect(getJson('/api/thing')).rejects.toMatchObject({ status: 503, detail: 'down' });
  });
});

describe('postForm', () => {
  it('sends multipart form data', async () => {
    let contentType: string | null = null;
    server.use(
      http.post('/api/upload', ({ request }) => {
        // Reading a multipart body hangs under jsdom; the header is enough.
        contentType = request.headers.get('Content-Type');
        return HttpResponse.json({ ok: true });
      }),
    );
    const form = new FormData();
    form.append('file', new File(['x'], 'a.pdf'));

    await expect(postForm('/api/upload', form)).resolves.toEqual({ ok: true });
    expect(contentType).toMatch(/^multipart\/form-data; boundary=/);
  });
});
