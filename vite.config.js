import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/usuarios': {
        target: process.env.BACKEND_URL || 'https://sitio-web-para-actividades-sociales.onrender.com',
        changeOrigin: true,
      },
      '/actividades': {
        target: process.env.BACKEND_URL || 'https://sitio-web-para-actividades-sociales.onrender.com',
        changeOrigin: true,
      },
      '/health': {
        target: process.env.BACKEND_URL || 'https://sitio-web-para-actividades-sociales.onrender.com',
        changeOrigin: true,
      }
    }
  }
})
