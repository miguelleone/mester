import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  // Lê o .env da raiz do repo para saber a porta da API
  const env = loadEnv(mode, '../..', '')
  const apiPort = env.PORT ?? '3333'

  return {
    plugins: [react(), tailwindcss()],
    // Variáveis VITE_* também vêm do .env da raiz (ex.: VITE_MAP_TILES)
    envDir: '../..',
    server: {
      proxy: { '/api': { target: `http://localhost:${apiPort}`, rewrite: (p) => p.replace(/^\/api/, '') } },
    },
  }
})
