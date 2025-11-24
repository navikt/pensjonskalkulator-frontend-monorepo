import { defineConfig, devices } from '@playwright/test'
import os from 'os'

const cpuCount = os.cpus().length
const totalMemoryGB = Math.floor(os.totalmem() / 1024 / 1024 / 1024)

const workers = process.env.CI
  ? Math.min(4, cpuCount)
  : Math.min(Math.floor(cpuCount * 0.8), Math.floor(totalMemoryGB / 2))

export default defineConfig({
  testDir: './playwright/e2e/pensjon/kalkulator',
  outputDir: './playwright/test-results',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers,
  reporter: process.env.CI
    ? 'line'
    : [['html', { outputFolder: 'playwright/report', open: 'never' }]],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retry-with-trace',
    screenshot: 'off',
    video: 'retry-with-video',
    navigationTimeout: 15000,
    actionTimeout: 10000,
    ignoreHTTPSErrors: true,
    bypassCSP: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
        launchOptions: {
          args: [
            '--headless=new',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu',
            '--disable-gpu-sandbox',
            '--disable-software-rasterizer',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees,VizDisplayCompositor',
            '--disable-extensions',
            '--disable-default-apps',
            '--disable-sync',
            '--disable-background-networking',
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--memory-pressure-off',
            '--max_old_space_size=4096',
          ],
        },
      },
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        headless: true,
      },
    },
    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
        headless: true,
      },
    },
  ],

  webServer: {
    command: 'npm run preview',
    port: 4173,
    timeout: 60000,
  },
})
