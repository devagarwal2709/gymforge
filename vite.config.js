import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // In development, anything starting with /api is forwarded to the Express server
  server: { proxy: { '/api': 'http://localhost:4000' } },
})