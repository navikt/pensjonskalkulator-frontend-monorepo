import path from 'path'
import { defineCliConfig } from 'sanity/cli'

// Do NOT import from sanity.config — jiti (CLI loader) cannot parse TSX in the import chain
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
