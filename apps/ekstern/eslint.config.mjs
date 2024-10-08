import react from 'eslint-plugin-react'
import _import from 'eslint-plugin-import'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import { fixupPluginRules } from '@eslint/compat'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

export default [
  {
    ignores: [
      'dist/*',
      '.nginx/*',
      '.nais/*',
      'nais.js',
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
    ],
  },
  ...compat.extends('prettier'),
  {
    plugins: {
      react,
      import: fixupPluginRules(_import),
      '@typescript-eslint': typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.amd,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',

      parserOptions: {
        parser: '@typescript-eslint/parser',
        project: ['./tsconfig.json', './tsconfig.server.json'],
        tsconfigRootDir: __dirname,

        ecmaFeatures: {
          jsx: true,
          impliedStrict: true,
        },
      },
    },

    settings: {
      react: {
        version: 'detect',
      },
    },

    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-duplicate-enum-values': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-shadow': ['error'],
      'react/jsx-curly-brace-presence': [
        'warn',
        {
          props: 'never',
          children: 'never',
        },
      ],
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
