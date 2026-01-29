import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { defineConfig } from 'vite'
import eslint from 'vite-plugin-eslint'
import sassDts from 'vite-plugin-sass-dts'
import stylelint from 'vite-plugin-stylelint'
import tsconfigPaths from 'vite-tsconfig-paths'

import CustomPostCSSLoader from './scripts/CustomPostCSSLoader'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pensjon/kalkulator',
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        appBorger: resolve(__dirname, './index.html'),
        appVeileder: resolve(__dirname, './veileder/index.html'),
      },
      external: ['./nais.js'],
      output: {
        manualChunks: {
          ['highcharts']: ['highcharts', 'highcharts/modules/accessibility'],
          ['react-redux']: [
            'react',
            'react-dom',
            'react-redux',
            'redux',
            'redux-thunk',
            '@reduxjs/toolkit',
            'react-router',
          ],
          ['designsystem']: ['@navikt/ds-react'],
          ['faro']: ['@grafana/faro-web-sdk'],
          ['intl']: [
            'react-intl',
            'intl-messageformat',
            '@formatjs/intl',
            '@formatjs/intl-numberformat',
          ],
        },
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: ['@babel/plugin-syntax-import-attributes'],
      },
    }),
    process.env.NODE_ENV !== 'test' && eslint(),
    process.env.NODE_ENV !== 'test' && stylelint({ fix: true }),
    process.env.NODE_ENV !== 'test' && !process.env.VITEST && sassDts(),

    process.env.NODE_ENV !== 'test' &&
      visualizer({
        open: false,
        gzipSize: true,
        brotliSize: true,
        filename: 'analice.html',
      }),

    // Custom plugin to set Service-Worker-Allowed header for MSW in development
    process.env.NODE_ENV !== 'test' && {
      name: 'msw-service-worker-allowed',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/pensjon/kalkulator/mockServiceWorker.js') {
            res.setHeader('Service-Worker-Allowed', '/')
          }
          next()
        })
      },
    },
  ].filter(Boolean),
  server: {
    proxy: {
      '/pensjon/kalkulator/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    modules: {
      // @ts-expect-error
      Loader: CustomPostCSSLoader,
      generateScopedName: (name, fileName) => {
        const pathArray = fileName.split('/')
        const fileNameWithExtension = pathArray[pathArray.length - 1]
        const fileNameArray = fileNameWithExtension.split('.')
        return `${fileNameArray[0]}--${name}`
      },
    },
    preprocessorOptions: {
      scss: {},
    },
  },
  test: {
    cache: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/test-setup.ts',
    testTimeout: 10000,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'playwright/**/*',
      'cypress/**/*',
      // Exclude Simuleringsdetaljer tests while component is commented out
      'src/components/Simulering/Simuleringsdetaljer/__tests__/Simuleringsdetaljer.test.tsx',
    ],
    coverage: {
      provider: 'v8',
      all: true,
      extension: ['.ts', '.tsx'],
      exclude: [
        '**/*/faro.ts',
        '*.config.ts',
        'cypress',
        'playwright',
        'sanity.cli.ts',
        'server/server.ts',
        'server/ensureEnv.ts',
        'src/mocks',
        'src/mocks/mockedRTKQueryApiCalls.ts',
        'src/test-utils.tsx',
        'src/main.tsx',
        'src/main-veileder.tsx',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/**/__tests__',
        'src/**/index.ts',
        'src/state/hooks.ts',
        'src/components/common/ShowMore',
        'src/types',
        'src/paths.ts',
        'schemaTypes/**',
        'src/components/Signals/**',
        'src/components/Simulering/Simuleringsdetaljer/Simuleringsdetaljer.tsx',
        'sanity',
      ],
      perFile: true,
      thresholds: {
        lines: 85,
        functions: 50,
        branches: 85,
        statements: 85,
      },
      reporter: ['json', 'html', 'text', 'text-summary', 'cobertura'],
    },
  },
})
