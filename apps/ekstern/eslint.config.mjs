import { createConfig } from '../../eslint.config.mjs'

const ignoredFiles = ['eslint.config.mjs', 'scripts/FetchLandListe.js']

export default createConfig({
  ignoredFiles,
  tsconfigRootDir: import.meta.dirname,
})
