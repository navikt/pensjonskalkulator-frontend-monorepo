import { createConfig } from '../../eslint.config.mjs'

const ignoredFiles = ['eslint.config.mjs']

export default createConfig({
	ignoredFiles,
	tsconfigRootDir: import.meta.dirname,
})
