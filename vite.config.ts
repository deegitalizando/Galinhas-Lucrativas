import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '', // Deixe vazio para que ele use caminhos relativos
  build: {
    outDir: 'dist',
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: true
  }
})
