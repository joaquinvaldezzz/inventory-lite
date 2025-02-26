import path from 'path'
import tailwindcss from '@tailwindcss/vite'
// import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8100,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-router-dom', 'react-dom'],
          'ionic-react': ['@ionic/react'],
          'ionic-react-router': ['@ionic/react-router'],
          'tanstack-react-query': ['@tanstack/react-query'],
          'tanstack-react-table': ['@tanstack/react-table'],
        },
      },
    },
  },
})
