import { defineCliConfig } from 'sanity/cli'
import { projectId } from './sanity.config'

export default defineCliConfig({
  api: {
    projectId,
    // TODO bør være "development" når applikasjonen er i staging
    dataset: 'production',
  },
  /**
   * Enable auto-updates for studios.
   * Learn more at https://www.sanity.io/docs/cli#auto-updates
   */
  autoUpdates: true,
})
