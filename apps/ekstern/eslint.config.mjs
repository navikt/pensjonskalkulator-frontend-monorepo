import _import from 'eslint-plugin-import'
import { fixupPluginRules } from '@eslint/compat'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

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
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    ignores: [...ignoredFiles],
  }))
)

export default [
  ...defaultEslintConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },
  {
    ignores: [...ignoredFiles],
    plugins: {
      import: fixupPluginRules(_import),
    },
    rules: {
      'no-debugger': 'warn',
      'no-shadow': 'off',
      'no-irregular-whitespace': ['error', { skipTemplates: true }],
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      '@typescript-eslint/no-shadow': ['error'],
      '@typescript-eslint/naming-convention': 'off',
      'import/order': [
        'warn',
        {
          pathGroups: [
            {
              pattern: '{react*,redux*}',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '~/**',
              group: 'external',
            },
            {
              pattern: '@/**',
              group: 'parent',
            },
            {
              pattern: './*.scss',
              group: 'sibling',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
    },
  },
]
