import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'
import sassDts from 'vite-plugin-sass-dts'
import path from 'path'

import type { UserConfig } from 'vitest/config'

const testConfig: UserConfig = {
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/test-setup.ts',
    coverage: {
      provider: 'c8',
      all: true,
      extension: ['.ts', '.tsx'],
      exclude: [
        'vite.config.ts',
        'src/test-utils.ts',
        'src/**/*.d.ts',
        'src/**/__tests__',
      ],
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
export default defineConfig(({ mode }) => ({
  base: '/pensjon/kalkulator/',
  plugins: [
    react(),
    eslint(),
    stylelint({ fix: true }),
    htmlPlugin(loadEnv(mode, '.')),
    sassDts({
      global: {
        generate: true,
        outFile: path.resolve(__dirname, './src/style.d.ts'),
      },
    }),
  ],
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
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/styles" as common;`,
        importer(...args) {
          if (args[0] !== '@/styles') {
            return
          }
          return {
            file: `${path.resolve(__dirname, './public')}`,
          }
        },
      },
    },
  },
  ...testConfig,
}))

/**
 * Replace env variables in index.html
 * @see https://github.com/vitejs/vite/issues/3105#issuecomment-939703781
 * @see https://vitejs.dev/guide/api-plugin.html#transformindexhtml
 */
function htmlPlugin(env: ReturnType<typeof loadEnv>) {
  return {
    name: 'html-transform',
    transformIndexHtml: {
      enforce: 'pre' as const,
      transform: (html: string): string =>
        html.replace(/%(.*?)%/g, (match, p1) => env[p1] ?? match),
    },
  }
}
