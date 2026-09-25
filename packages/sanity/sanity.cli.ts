import path from 'path'
import { defineCliConfig } from 'sanity/cli'

import { projectId } from './src/projectId'

export default defineCliConfig({
	api: {
		projectId: 'g2by7q6m',
		dataset: 'development',
	},
	/**
	 * Enable auto-updates for studios.
	 * Learn more at https://www.sanity.io/docs/cli#auto-updates
	 */
	deployment: { autoUpdates: true },
	vite: {
		resolve: {
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
	},
})
