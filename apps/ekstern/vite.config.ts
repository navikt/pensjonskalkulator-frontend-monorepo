import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'

import type { UserConfig } from 'vitest/config'

const testConfig: UserConfig = {
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'c8',
      all: true,
      extension: ['.ts', '.tsx'],
      exclude: ['vite.config.ts', 'src/**/*.d.ts', 'src/test-utils.ts'],
      perFile: true,
      lines: 95,
      functions: 95,
      branches: 95,
      statements: 95,
      reporter: ['json', 'html', 'text', 'text-summary', 'cobertura'],
    },
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pensjon/kalkulator/',
  plugins: [react(), eslint(), stylelint({ fix: true })],
  server: {
    proxy: {
      '/pensjon/kalkulator/api': {
        target: process.env.VITE_MOCKAPI
          ? 'http://localhost:8088'
          : 'https://pensjonskalkulator-backend.dev.nav.no',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/pensjon\/kalkulator/, ''),
      },
    },
  },
  ...testConfig,
})
