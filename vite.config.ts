// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- Required for Vite to work with Vitest
/// <reference types="vitest" />

import path from 'path'
import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [legacy(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8100,
    proxy: {
      '/api': {
        target: 'http://trial.integra-payroll.com/api/login.php',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),

        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('error', err)
          })
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Request sent to target:', req.method, req.url)
          })
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Response received from target:', proxyRes.statusCode, req.url)
          })
        },
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-router-dom', 'react-dom'],
          ionic: ['@ionic/react', '@ionic/react-router'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup-tests.ts',
  },
})
