import path from 'path'
import { defineCliConfig } from 'sanity/cli'

import { projectId } from './sanity.config'

export default defineCliConfig({
  api: {
    projectId,
    dataset: 'development',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
  vite: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  },
})
