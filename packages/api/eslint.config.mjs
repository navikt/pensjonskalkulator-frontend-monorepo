import { createConfig } from '../../eslint.config.mjs'

export default createConfig({
	ignoredFiles: ['eslint.config.mjs'],
	tsconfigRootDir: import.meta.dirname,
})
