import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.API_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ['app.scaleopsolutions.com'],
    proxy: {
      '/agendamentos': apiTarget,
      '/bloqueios': apiTarget,
      '/disponibilidade': apiTarget,
      '/usuarios': apiTarget,
      '/instrutores': apiTarget,
      '/veiculos': apiTarget,
      '/auth': apiTarget,
      '/instrutor': apiTarget,
      '/health': apiTarget,
    },
  },
})
