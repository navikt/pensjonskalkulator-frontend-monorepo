import { defineCliConfig } from 'sanity/cli'
import { resolve } from 'path'
export default defineCliConfig({
  api: {
    projectId: 'g2by7q6m',
    dataset: 'production',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
