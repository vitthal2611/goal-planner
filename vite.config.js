import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'public',
  server: {
    port: 5000,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
