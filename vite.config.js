/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy(),
    visualizer({
      filename: 'dist/bundle-analyzer.html',
      open: false,
      gzipSize: true
    })
  ],
  server: {
    port: 8101,
    host: '0.0.0.0',
    strictPort: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // React ecosystem
          'react-vendors': ['react', 'react-dom', 'react-router', 'react-router-dom'],
          
          // Ionic core
          'ionic-core': ['@ionic/react', '@ionic/react-router'],
          
          // Capacitor ecosystem
          'capacitor': [
            '@capacitor/core',
            '@capacitor/app',
            '@capacitor/haptics',
            '@capacitor/keyboard',
            '@capacitor/network',
            '@capacitor/push-notifications',
            '@capacitor/status-bar'
          ],
          
          // i18n
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          
          // Utilities
          'utils': ['ionicons']
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
