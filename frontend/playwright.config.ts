import { defineConfig, devices } from '@playwright/test';

// The demo flow from specs/testing.md against the full local stack: the real
// backend with the fake LLM (no network, deterministic replies) and the
// production build of the frontend, signed in with the dev login.
const CI = !!process.env.CI;

// Test-only secrets: the frontend signs each API call with AUTH_TOKEN_SECRET and
// the backend checks it (roadmap 4.3).
const AUTH_TOKEN_SECRET = 'e2e-token-secret-at-least-32-bytes-long';

// Tasks live in Postgres (roadmap 4.4): a database for E2E only, migrated on start.
// docker compose creates pebble_e2e; CI runs a service container.
const DATABASE_URL = process.env.E2E_DATABASE_URL ?? 'postgresql+asyncpg://pebble:pebble@localhost:5432/pebble_e2e';

const backendEnv = { LLM_PROVIDER: 'fake', AUTH_TOKEN_SECRET, DATABASE_URL };

// With E2E_BACKEND_IMAGE (CI, roadmap 10.1) the backend is the built image, which migrates on start;
// otherwise it runs from source with uv. The image uses the host's network to reach Postgres on localhost.
const BACKEND_IMAGE = process.env.E2E_BACKEND_IMAGE;
const backendCommand = BACKEND_IMAGE
  ? `docker run --rm --init --network host ${Object.entries({ ...backendEnv, PORT: '8000' })
      .map(([key, value]) => `-e ${key}=${value}`)
      .join(' ')} ${BACKEND_IMAGE}`
  : 'uv run --locked alembic upgrade head && uv run --locked uvicorn app.main:app --port 8000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: CI,
  retries: 0, // a flaky test is fixed, never retried (specs/testing.md)
  reporter: CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: backendCommand,
      cwd: '../backend',
      url: 'http://localhost:8000/api/health',
      env: backendEnv,
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'npm run build && npx next start -p 3000',
      url: 'http://localhost:3000/signin',
      env: {
        AUTH_SECRET: 'e2e-session-secret-at-least-32-bytes-long',
        AUTH_TOKEN_SECRET,
        AUTH_DEV_LOGIN: 'true',
        AUTH_TRUST_HOST: 'true',
        BACKEND_URL: 'http://localhost:8000',
      },
      reuseExistingServer: !CI,
      timeout: 300_000,
    },
  ],
});
