import eslint from '@eslint/js'
import vitest from '@vitest/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import reactPlugin from 'eslint-plugin-react'
import sonarjsPlugin from 'eslint-plugin-sonarjs'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export function createConfig({
	ignoredFiles = [],
	tsconfigRootDir = process.cwd(),
} = {}) {
	const baseIgnoredFiles = [
		'dist/**',
		'dist-sanity/**',
		'.nginx/*',
		'.nais/*',
		'src/nais.js',
		'*.config.mjs',
		'**/coverage',
		'**/vite.config.ts*',
		'**/.stylelintrc.cjs',
		'**/.prettierrc.cjs',
		'**/tsconfig.json',
		'server/server.ts',
		'**/tsconfig.node.json',
		'**/*.scss.d.ts',
		'**/style.d.ts',
		'cypress.config.ts',
		'playwright.config.ts',
		'**/mockServiceWorker.js',
		'**/cypress',
		'playwright/**',
		'public/src/nais.js',
		'sanity.cli.ts',
		'sanity.config.ts',
		'src/translations/**',
		...ignoredFiles,
	]

	const defaultEslintConfig = tseslint.config(
		{
			...eslint.configs.recommended,
			ignores: [...baseIgnoredFiles],
		},
		...tseslint.configs.recommendedTypeChecked.map((config) => ({
			...config,
			ignores: [...baseIgnoredFiles],
		})),
		reactPlugin.configs.flat.recommended,
		reactPlugin.configs.flat['jsx-runtime']
	)

	return [
		{
			ignores: [...baseIgnoredFiles, 'playwright/**/*'],
		},
		...defaultEslintConfig,
		{
			settings: { react: { version: 'detect' } },
			languageOptions: {
				globals: {
					...globals.node,
				},
				parserOptions: {
					projectService: {
						allowDefaultProject: ['*.config.mjs', '*.config.js'],
					},
					tsconfigRootDir,
				},
			},
		},
		{
			ignores: [...baseIgnoredFiles],
			plugins: {
				import: importPlugin,
				sonarjs: sonarjsPlugin,
			},
			rules: {
				'no-debugger': 'warn',
				'no-irregular-whitespace': ['error', { skipTemplates: true }],
				'@typescript-eslint/no-unused-vars': 'warn',
				'@typescript-eslint/no-duplicate-enum-values': 'warn',
				'@typescript-eslint/no-shadow': 'error',
				'@typescript-eslint/no-floating-promises': 'off',
				'@typescript-eslint/no-unsafe-assignment': 'warn',
				'@typescript-eslint/no-unsafe-member-access': 'warn',
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
				'sonarjs/no-useless-catch': 'warn',
				'sonarjs/prefer-immediate-return': 'warn',
				'sonarjs/no-collapsible-if': 'error',
				'sonarjs/no-gratuitous-expressions': 'error',
				'sonarjs/no-inverted-boolean-check': 'warn',
				'sonarjs/prefer-while': 'warn',
			},
		},
		{
			files: [
				'**/*.test.ts',
				'**/*.test.tsx',
				'**/__tests__/**/*.ts',
				'**/__tests__/**/*.tsx',
				'**/cypress/**/*.ts',
				'**/cypress/**/*.tsx',
				'**/*.cy.ts',
				'**/*.cy.tsx',
				'**/*.spec.ts',
				'**/*.spec.tsx',
				'**/playwright/**/*.ts',
				'**/playwright/**/*.tsx',
			],
			plugins: {
				vitest,
			},
			rules: {
				...vitest.configs.recommended.rules,
				'vitest/valid-title': 'off',
				'vitest/expect-expect': 'off',
				'vitest/no-standalone-expect': 'off',
				'vitest/no-identical-title': 'off',
				'vitest/no-commented-out-tests': 'warn',
				'@typescript-eslint/ban-ts-comment': 'off',
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
				'sonarjs/no-duplicate-string': 'off',
				'sonarjs/cognitive-complexity': 'off',
				'sonarjs/no-identical-functions': 'off',
				'sonarjs/prefer-immediate-return': 'off',
			},
			languageOptions: {
				globals: {
					...vitest.environments.env.globals,
				},
			},
		},
		{
			files: [
				'**/cypress/**/*.ts',
				'**/cypress/**/*.tsx',
				'**/*.cy.ts',
				'**/*.cy.tsx',
			],
			rules: {
				'vitest/valid-expect-in-promise': 'off',
			},
		},
		{
			files: ['**/mocks/**/*.ts', '**/mocks/**/*.tsx'],
			rules: {
				'sonarjs/no-duplicate-string': 'off',
				'sonarjs/cognitive-complexity': 'off',
				'sonarjs/no-identical-functions': 'off',
				'sonarjs/prefer-immediate-return': 'off',
			},
		},
	]
}

export default createConfig()
