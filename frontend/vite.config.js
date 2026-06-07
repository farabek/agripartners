import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        app: 'index.html',
        walletAuthPoc: 'wallet-auth-poc.html',
      },
    },
  },
  define: {
    global: 'globalThis',
  },
  optimizeDeps: {
    include: [
      '@near-wallet-selector/core',
      '@near-wallet-selector/my-near-wallet',
      'buffer',
      'near-api-js',
    ],
  },
  resolve: {
    alias: {
      'js-sha256': fileURLToPath(new URL('./shims/js-sha256.js', import.meta.url)),
    },
  },
});
