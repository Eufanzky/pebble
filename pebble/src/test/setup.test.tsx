import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { server } from './msw/server';
import { renderWithProviders, screen } from './render';

// Checks the test tooling itself, so a broken setup fails loudly here rather
// than as confusing failures in feature tests.
describe('test setup', () => {
  it('serves requests from MSW handlers', async () => {
    server.use(http.get('/api/ping', () => HttpResponse.json({ ok: true })));

    const response = await fetch('/api/ping');

    expect(await response.json()).toEqual({ ok: true });
  });

  it('rejects requests that have no handler', async () => {
    await expect(fetch('/api/unhandled')).rejects.toThrow();
  });

  it('renders inside the app providers and drives it with user-event', async () => {
    function Toggle() {
      return (
        <label>
          <input type="checkbox" /> Calm mode
        </label>
      );
    }
    const { user } = renderWithProviders(<Toggle />);

    await user.click(screen.getByLabelText('Calm mode'));

    expect(screen.getByLabelText('Calm mode')).toBeChecked();
  });

  it('runs axe checks', async () => {
    const { container } = renderWithProviders(<button type="button">Start</button>);

    expect(await axe(container)).toHaveNoViolations();
  });
});
