import { defineConfig, devices } from '@playwright/test';

/**
 * Shopro Restaurant Web — Playwright Configuration
 * 
 * Custom app architecture:
 * - Zustand-based state management (no standard auth context)
 * - Screen-based navigation (dashboard, inventory, purchasing, etc.)
 * - Multiple login modes: staff PIN, ShoPro admin, guest
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
  ],
  
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    // 1. Setup project - runs auth.setup.ts first
    {
      name: 'setup',
      testMatch: '**/fixtures/auth.setup.ts',
    },

    // 2. Authenticated tests - all specs that need login
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: [
        '**/*.spec.ts',
        '!**/fixtures/auth.setup.ts',
      ],
    },

    // 3. Firefox - cross-browser validation
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: [
        '**/dashboard.spec.ts',
        '**/inventory.spec.ts',
        '**/purchasing.spec.ts',
      ],
    },

    // 4. Mobile - responsive testing
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        storageState: 'tests/.auth/user.json',
      },
      dependencies: ['setup'],
      testMatch: [
        '**/dashboard.spec.ts',
        '**/kds.spec.ts',
      ],
    },
  ],

  outputDir: 'test-results/',
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 5 * 1000, // 5 seconds for assertions
  },
});
