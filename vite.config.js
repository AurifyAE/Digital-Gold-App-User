import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    host: true,
    allowedHosts: ['bc013932c2ca.ngrok-free.app'], 
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
