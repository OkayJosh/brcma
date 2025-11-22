import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseFromEnv = env.VITE_BASE_PATH || env.BASE_PATH || env.NEXT_PUBLIC_BASE_PATH || '/app/'
  const normalizedBase = baseFromEnv.endsWith('/') ? baseFromEnv : `${baseFromEnv}/`

  return {
    base: mode === 'production' ? normalizedBase : '/',
    plugins: [react()],
    server: {
      port: 5173,
      host: true
    }
  }
})
