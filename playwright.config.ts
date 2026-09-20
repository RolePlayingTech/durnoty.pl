import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:4322', trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run seed && npm run start',
    url: 'http://127.0.0.1:4322/api/health',
    reuseExistingServer: false,
    env: {
      HOST: '127.0.0.1',
      PORT: '4322',
      SITE_URL: 'http://127.0.0.1:4322',
      DATABASE_PATH: './test-results/e2e.sqlite',
      MUMRO_CMS_SECRET: 'e2e-only-isolated-cms-secret-not-for-production',
    },
  },
});
