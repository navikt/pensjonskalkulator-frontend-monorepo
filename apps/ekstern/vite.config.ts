import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint'
import stylelint from 'vite-plugin-stylelint'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pensjon/kalkulator/',
  plugins: [react(), eslint(), stylelint({ fix: true })],
})
