import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Use system Chromium
    channel: 'chromium',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        executablePath: '/usr/bin/chromium',
      },
    },
    {
      name: 'mobile',
      testIgnore: /turns/,
      use: {
        ...devices['Pixel 5'],
        executablePath: '/usr/bin/chromium',
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: { VITE_SERVER_URL: 'http://localhost:3011' },
    },
    {
      command: 'npm run dev --prefix ../server',
      url: 'http://localhost:3011',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
      env: { PORT: '3011', CORS_ORIGIN: 'http://localhost:5173' },
    },
  ],
});
