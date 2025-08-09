/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
      modernPolyfills: true
    }),
    visualizer({
      filename: 'dist/bundle-analyzer.html',
      open: false,
      gzipSize: true,
      brotliSize: true
    })
  ],
  server: {
  port: 8101,
  host: '0.0.0.0', // Hem IPv4 hem IPv6 desteği için
  strictPort: true // Port meşgulse hata ver, otomatik değiştirme
  },
  build: {
    // Rollup options'ı optimize et
    rollupOptions: {
      output: {
        // Daha detaylı manual chunks
        manualChunks: {
          // React ecosystem - core
          'react-core': ['react', 'react-dom'],
          
          // React routing - ayrı chunk
          'react-router': ['react-router', 'react-router-dom'],
          
          // Ionic core'u parçalara böl - çok büyük!
          'ionic-components': ['@ionic/react'],
          'ionic-router': ['@ionic/react-router'],
          
          // Capacitor plugins - farklı kategorilerde grupla
          'capacitor-core': ['@capacitor/core', '@capacitor/app'],
          'capacitor-ui': ['@capacitor/haptics', '@capacitor/status-bar', '@capacitor/keyboard'],
          'capacitor-network': ['@capacitor/network', '@capacitor/push-notifications'],
          
          // i18n ecosystem
          'i18n': ['i18next', 'react-i18next', 'i18next-browser-languagedetector'],
          
          // Supabase - büyük dependency, ayrı chunk
          'supabase': ['@supabase/supabase-js'],
          
          // Icons - sadece gerektiğinde yüklensin
          'icons': ['ionicons'],
          
          // Tailwind utilities - eğer kullanılıyorsa
          'utilities': ['@tailwindcss/line-clamp']
        },
        // Chunk size kontrolü
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop().replace('.tsx', '').replace('.ts', '') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        }
      },
      // External dependencies - CDN'den yüklenebilecek olanlar
      external: (id) => {
        // Geliştirme ortamında external'ı devre dışı bırak
        if (process.env.NODE_ENV === 'development') return false;
        
        // Production'da büyük dependencies'i external yapabilirsin (CDN kullanıyorsan)
        return false; // Şimdilik hepsini bundle'a dahil et
      }
    },
    // Build optimizasyonları
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Console.log'ları production'da kaldır
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      },
      mangle: {
        safari10: true
      }
    },
    // Chunk size limitleri
    chunkSizeWarningLimit: 300, // 300kb chunk uyarı limiti
    reportCompressedSize: true,
    sourcemap: false, // Production'da sourcemap'i kapat
  },
  // CSS optimizasyonu
  css: {
    devSourcemap: false
  },
  // Dependency optimizasyonu
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@ionic/react',
      '@ionic/react-router'
    ],
    exclude: [
      // Büyük dependencies'i exclude ederek lazy loading'e zorla
    ]
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
