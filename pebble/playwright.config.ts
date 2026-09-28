import { defineConfig, devices } from '@playwright/test';

// The demo flow from specs/testing.md against the full local stack: the real
// backend with the fake LLM (no network, deterministic replies) and the
// production build of the frontend.
const CI = !!process.env.CI;

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
      command: 'uv run --locked uvicorn app.main:app --port 8000',
      cwd: '../backend',
      url: 'http://localhost:8000/api/health',
      env: { LLM_PROVIDER: 'fake', DEV_MODE: 'true' },
      reuseExistingServer: !CI,
      timeout: 120_000,
    },
    {
      command: 'npm run build && npx next start -p 3000',
      url: 'http://localhost:3000/today',
      reuseExistingServer: !CI,
      timeout: 300_000,
    },
  ],
});
