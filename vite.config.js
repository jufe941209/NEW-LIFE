import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true
  },
  publicDir: 'public',
  base: '/', // Rutas absolutas — necesario para Vercel SPA routing
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})


