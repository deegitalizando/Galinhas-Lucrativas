import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: true
  },
  preview: {
    port: 8080,
    host: true,
    allowedHosts: true
  },
  base: './' // Isso garante que o site encontre os arquivos em qualquer link
})
