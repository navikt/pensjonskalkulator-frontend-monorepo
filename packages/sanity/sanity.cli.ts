import path from 'path'
import { projectId } from './sanity.config'
import { defineCliConfig } from 'sanity/cli'

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
