import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'
import sassDts from 'vite-plugin-sass-dts'
import { visualizer } from 'rollup-plugin-visualizer'
import CustomPostCSSLoader from './scripts/CustomPostCSSLoader'
import path from 'path'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
// TODO manualChunks fungerer ikke som forventet - prøve alternativer for code splitting
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: '/pensjon/kalkulator/',
    build: {
      sourcemap: true,
      rollupOptions: {
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
      eslint(),
      stylelint({ fix: true }),
      htmlPlugin(env),
      sassDts({
        global: {
          generate: true,
          outFile: path.resolve(__dirname, './src/style.d.ts'),
        },
      }),
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
      environment: 'jsdom',
      globals: true,
      setupFiles: 'src/test-setup.ts',
      coverage: {
        provider: 'c8',
        all: true,
        extension: ['.ts', '.tsx'],
        exclude: [
          '*.config.ts',
          'src/mocks',
          'src/test-utils.tsx',
          'src/**/*.d.ts',
          'src/**/__tests__',
          'src/main.tsx',
          'src/**/index.ts',
          'src/state/hooks.ts',
          'cypress',
          'src/types',
        ],
        perFile: true,
        lines: 95,
        functions: 75,
        branches: 95,
        statements: 95,
        reporter: ['json', 'html', 'text', 'text-summary', 'cobertura'],
      },
    },
  }
})

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
