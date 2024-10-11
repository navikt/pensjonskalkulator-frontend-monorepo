import _import from 'eslint-plugin-import'
import { fixupPluginRules } from '@eslint/compat'
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

const ignoredFiles = [
  'eslint.config.mjs',
  'dist/*',
  '.nginx/*',
  '.nais/*',
  'src/nais.js',
  '**/api',
  '**/coverage',
  '**/vite.config.ts',
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
    ignores: [...ignoredFiles],
    plugins: {
      import: fixupPluginRules(_import),
    },
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-shadow': ['error'],
      'no-irregular-whitespace': 'warn',
      'no-shadow': 'off',
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
