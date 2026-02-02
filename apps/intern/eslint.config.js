import js from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

export default [
	{
		ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		plugins: {
			react: reactPlugin,
			'react-hooks': reactHooks,
		},
		settings: {
			react: {
				version: 'detect',
			},
		},
		rules: {
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',
		},
	},
]
