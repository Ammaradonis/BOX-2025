import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Vite configuration optimized for Netlify + React + TypeScript + Tailwind
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      "~": path.resolve(__dirname, "src")
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build', // Netlify serves this as the publish directory
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  preview: {
    port: 4173,
    open: true,
  },
})
