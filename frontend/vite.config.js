import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    allowedHosts: [
      'michele-comfiest-soo.ngrok-free.dev',
      '.ngrok-free.dev',
      '.ngrok.io',
    ],
  },
});
