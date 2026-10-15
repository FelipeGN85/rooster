import { defineConfig, devices } from '@playwright/test';

const PORT = 4310;
const CI = Boolean(process.env['CI']);

/**
 * End-to-end tests run the production build in a real browser. Everything
 * except the online game stays on this machine; the online test also talks to
 * the public PeerJS broker, which introduces the two browsers (see fixtures).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 1 : undefined,
  reporter: CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: 'en-US',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // The production build, served by Angular's own server: no extra tooling.
    command: `ng serve --configuration production --port ${PORT} --live-reload false --hmr false`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !CI,
    timeout: 120_000,
  },
});
