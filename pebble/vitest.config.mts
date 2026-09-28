import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    // Full-view renders with axe take 1-2 s alone and several times that when
    // every file runs in parallel on a slow machine. The default 5 s timed out
    // there; a hang still fails.
    testTimeout: 15_000,
    // Roadmap 3.8: logic lives in each feature's lib/ and hooks/, so that is
    // where the floor applies (specs/testing.md). `npm run test:coverage`.
    coverage: {
      provider: 'v8',
      include: ['src/features/*/lib/**', 'src/features/*/hooks/**'],
      exclude: ['**/*.test.{ts,tsx}'],
      reporter: ['text-summary', 'text'],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 },
    },
  },
});
