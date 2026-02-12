import { dirname } from 'path'
import { fileURLToPath } from 'url'

import { createConfig } from '../../eslint.config.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))

const ignoredFiles = ['eslint.config.mjs']

export default createConfig({
	ignoredFiles,
	tsconfigRootDir: __dirname,
})
