module.exports = {
  root: true,
  extends: ['react-typescript', 'prettier'],
  plugins: ['react', 'import', '@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: ['./tsconfig.json'],
    tsconfigRootDir: __dirname,
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      impliedStrict: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  env: {
    browser: true,
    amd: true,
    node: true,
  },
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'warn',
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
}
