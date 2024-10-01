import { defineCliConfig } from 'sanity/cli'
import { resolve } from 'path'
export default defineCliConfig({
  api: {
    projectId: 'g2by7q6m',
    dataset: 'production',
  },
  vite: {
    build: {
      outDir: 'dist-sanity',
      emptyOutDir: true,
    },
    resolve: {
      alias: {
        '@': __dirname,
      },
    },
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
