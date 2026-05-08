import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: true,
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    lib: {
      entry: 'src/main.tsx',
      name: 'ListingEditor',
      fileName: 'listing-editor',
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})