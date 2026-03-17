import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'public',
  envDir: resolve(__dirname, '.'),
  server: {
    port: 5000,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
