import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/jev-agent-routing-lab/',
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('zrender')) {
            return 'zrender-vendor'
          }
          if (id.includes('echarts')) {
            return 'echarts-core'
          }
          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }
        },
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('zrender')) {
            return 'zrender-vendor'
          }
          if (id.includes('echarts')) {
            return 'echarts-core'
          }
          if (id.includes('react') || id.includes('scheduler')) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
