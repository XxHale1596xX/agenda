import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.API_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // escuta em 0.0.0.0 — necessário dentro de container
    port: 5173,
    proxy: {
      '/agendamentos': apiTarget,
      '/bloqueios': apiTarget,
      '/disponibilidade': apiTarget,
      '/usuarios': apiTarget,
      '/health': apiTarget,
    },
  },
})
