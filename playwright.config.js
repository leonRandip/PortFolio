import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:5174',
    headless: true,
    viewport: { width: 1280, height: 800 },
    video: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
