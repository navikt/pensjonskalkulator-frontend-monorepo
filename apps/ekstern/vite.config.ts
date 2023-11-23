import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'
import sassDts from 'vite-plugin-sass-dts'
import { visualizer } from 'rollup-plugin-visualizer'
import CustomPostCSSLoader from './scripts/CustomPostCSSLoader'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig(() => ({
  base: '/pensjon/kalkulator',
  build: {
    sourcemap: true,
    rollupOptions: {
      external: ['./nais.js'],
      output: {
        manualChunks: {
          highcharts: ['highcharts'],
          ['react-redux']: [
            'react',
            'react-dom',
            'react-redux',
            'redux',
            'redux-thunk',
            '@reduxjs/toolkit',
            '@reduxjs/toolkit/dist/query',
            'react-router-dom',
          ],
          ['intl']: [
            'react-intl',
            'intl-messageformat',
            '@formatjs/ecma402-abstract',
            '@formatjs/intl',
            '@formatjs/intl-datetimeformat',
            '@formatjs/intl-displaynames',
            '@formatjs/intl-listformat',
            '@formatjs/intl-localematcher',
            '@formatjs/intl-numberformat',
          ],
        },
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    react(),
    process.env.NODE_ENV !== 'test' && eslint(),
    process.env.NODE_ENV !== 'test' && stylelint({ fix: true }),
    process.env.NODE_ENV !== 'test' &&
      sassDts({
        global: {
          generate: true,
          outputFilePath: path.resolve(__dirname, './src/style.d.ts'),
        },
      }),
    process.env.NODE_ENV !== 'test' &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'analice.html',
      }),
  ],
  server: {
    proxy: {
      '/pensjon/kalkulator/api': {
        target: 'https://pensjonskalkulator-backend.ekstern.dev.nav.no',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    modules: {
      Loader: CustomPostCSSLoader,
      generateScopedName: (name, fileName) => {
        const pathArray = fileName.split('/')
        const fileNameWithExtension = pathArray[pathArray.length - 1]
        const fileNameArray = fileNameWithExtension.split('.')
        return `${fileNameArray[0]}--${name}`
      },
    },
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
  test: {
    cache: false,
    environment: 'jsdom',
    globals: true,
    setupFiles: 'src/test-setup.ts',
    coverage: {
      provider: 'v8',
      all: true,
      extension: ['.ts', '.tsx'],
      exclude: [
        '*.config.ts',
        'src/mocks',
        'src/test-utils.tsx',
        'src/**/*.d.ts',
        'src/**/*.types.ts',
        'src/**/__tests__',
        'src/main.tsx',
        'src/**/index.ts',
        'src/state/hooks.ts',
        'cypress',
        'src/types',
        '**/*/faro.ts',
      ],
      perFile: true,
      thresholds: { lines: 95, functions: 50, branches: 95, statements: 95 },
      reporter: ['json', 'html', 'text', 'text-summary', 'cobertura'],
    },
  },
}))
