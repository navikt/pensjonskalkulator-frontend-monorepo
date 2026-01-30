import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import { URL } from 'node:url'
import tseslint from 'typescript-eslint'

const __dirname = new URL('.', import.meta.url).pathname

export default [
	{
		ignores: [
			'**/dist/**',
			'**/node_modules/**',
			'**/coverage/**',
			'**/*.min.js',
			'pnpm-lock.yaml',
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: __dirname,
			},
		},
	},
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		rules: {
			...reactHooks.configs.recommended.rules,
		},
	},
]
