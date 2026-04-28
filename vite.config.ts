import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/Smart-resource-allocation/',
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Charts
          'vendor-recharts': ['recharts'],
          // Maps
          'vendor-leaflet': ['leaflet', 'react-leaflet'],
          // Firebase
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
          // Supabase
          'vendor-supabase': ['@supabase/supabase-js'],
          // Utilities
          'vendor-utils': ['lucide-react', 'react-hot-toast', 'jspdf'],
        },
      },
    },
  },
})
