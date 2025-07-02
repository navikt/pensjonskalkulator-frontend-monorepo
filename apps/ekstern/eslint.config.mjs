import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import reactPlugin from 'eslint-plugin-react'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const ignoredFiles = [
  'eslint.config.mjs',
  'dist/**',
  'dist-sanity/**',
  '.nginx/*',
  '.nais/*',
  'src/nais.js',
  '**/api',
  '**/coverage',
  '**/vite.config.ts*',
  '**/.stylelintrc.cjs',
  '**/tsconfig.json',
  'server/server.ts',
  '**/tsconfig.node.json',
  '**/*.scss.d.ts',
  '**/style.d.ts',
  'cypress.config.ts',
  '**/mockServiceWorker.js',
  '**/cypress',
  'public/src/nais.js',
  'scripts/FetchLandListe.js',
  'sanity.cli.ts',
]

const defaultEslintConfig = tseslint.config(
  {
    ...eslint.configs.recommended,
    ignores: [...ignoredFiles],
  },
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    ignores: [...ignoredFiles],
  })),
  reactPlugin.configs.flat.recommended,
  reactPlugin.configs.flat['jsx-runtime']
)

export default [
  ...defaultEslintConfig,
  {
    settings: { react: { version: 'detect' } }, // eslint-plugin-react needs this
    languageOptions: {
      globals: {
        ...globals.node,
      },
      // Needed for typed linting
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    ignores: [...ignoredFiles],
    plugins: {
      import: importPlugin,
    },
    rules: {
      'no-debugger': 'warn',
      'no-irregular-whitespace': ['error', { skipTemplates: true }],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/no-floating-promises': 'off',
      'react/jsx-curly-brace-presence': [
        'error',
        { props: 'never', children: 'never' },
      ],
      'react/hook-use-state': 'error',
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-props-no-spread-multi': 'error',
      'react/no-unstable-nested-components': 'error',
      'react/self-closing-comp': 'error',
      'react/style-prop-object': 'error',
      'import/export': 'error',
      'import/no-extraneous-dependencies': 'error',
      'import/no-duplicates': 'error',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off', // Fjern når @ts-ignore ikke lenger er i bruk i testkode
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            {
              from: 'file',
              name: 'renderWithProviders',
              path: 'src/test-utils.tsx',
            },
          ],
        },
      ],
    },
  },
]
