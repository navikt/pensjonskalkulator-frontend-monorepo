import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default [
	{
		ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**'],
	},
	{
		languageOptions: {
			parserOptions: {
				tsconfigRootDir: import.meta.dirname,
			},
		},
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
		},
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
			parserOptions: {
				project: ['./tsconfig.json', './tsconfig.server.json'],
				tsconfigRootDir: import.meta.dirname,
			},
		},
		rules: {
			...reactHooks.configs.recommended.rules,
		},
	},
]
