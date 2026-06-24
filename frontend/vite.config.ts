import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/') || id.includes('node_modules/react-router')) {
            return 'vendor'
          }
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'query'
          }
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform') || id.includes('node_modules/zod')) {
            return 'forms'
          }
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/react-day-picker')) {
            return 'dates'
          }
          if (id.includes('node_modules/lucide-react') || id.includes('node_modules/class-variance-authority') || id.includes('node_modules/tailwind-merge')) {
            return 'ui'
          }
        },
      },
    },
  },
})
