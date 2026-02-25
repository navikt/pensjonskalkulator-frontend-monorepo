import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// Modes:
// - "development" (default): MSW mocks, no proxy
// - "backend": Real backend via proxy to BFF
export default defineConfig(({ mode }) => ({
	plugins: [react()],
	server: {
		port: 5174,
		proxy:
			mode === 'backend'
				? {
						'/pensjon/kalkulator/api': {
							target: 'http://localhost:8080',
							changeOrigin: true,
						},
					}
				: undefined,
	},
}))
