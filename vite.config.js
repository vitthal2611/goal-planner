import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './quick-track-demo.html'
      }
    }
  },
  server: {
    open: '/quick-track-demo.html',
    port: 3000
  }
})
