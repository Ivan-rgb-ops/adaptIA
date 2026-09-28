import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    // Por defecto Vite solo acepta localhost (protege contra DNS rebinding).
    // Si necesitás exponerlo con un túnel (ngrok, cloudflared), definí
    // VITE_ALLOWED_HOSTS=mi-tunel.ngrok.app,otro.host en tu entorno.
    allowedHosts: process.env.VITE_ALLOWED_HOSTS
      ? process.env.VITE_ALLOWED_HOSTS.split(',').map((h) => h.trim())
      : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true
      }
    }
  }
});
