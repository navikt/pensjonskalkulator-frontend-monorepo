import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5174,
		proxy: {
			'/pensjon/kalkulator/api': {
				target: 'http://localhost:8080',
				changeOrigin: true,
			},
		},
	},
})
