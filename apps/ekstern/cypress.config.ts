import { defineConfig } from 'cypress'

export default defineConfig({
  chromeWebSecurity: false,
  env: {
    DECORATOR_URL: 'https://www.nav.no/dekoratoren',
    DEV_DECORATOR_URL: 'https://dekoratoren.ekstern.dev.nav.no',
  },
  e2e: {
    baseUrl: 'http://localhost:4173',
    setupNodeEvents(on) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'firefox') {
          launchOptions.preferences['ui.prefersReducedMotion'] = 1
        }
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--force-prefers-reduced-motion')
        }
        return launchOptions
      })
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
      })
    },
  },
})
