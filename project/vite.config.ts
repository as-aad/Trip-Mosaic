import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),

    // Bundle analyzer (only when ANALYZE=true)
    process.env.ANALYZE && {
      name: 'bundle-analyzer',
      apply: 'build',
      generateBundle(_, bundle) {
        const sizes: Record<string, number> = {}
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk') {
            sizes[fileName] = chunk.code.length
          }
        }
        console.log('📊 Bundle Analysis:', sizes)
      },
    },
  ].filter(Boolean),

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],

          // Feature chunks
          'feature-dashboard': [
            './src/components/TravelerDashboard.tsx',
            './src/components/DestinationDetailsModal.tsx',
          ],
          'feature-api': ['./src/services/api.ts'],

          // App entry / routes
          routes: ['./src/App.tsx', './src/main.tsx'],
        },

        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split('/')
                .pop()
                ?.replace(/\.(ts|tsx)$/, '')
            : 'chunk'
          return `js/${name}-[hash].js`
        },

        entryFileNames: 'js/[name]-[hash].js',

        assetFileNames: (assetInfo) => {
          const ext = assetInfo.name?.split('.').pop()
          if (ext === 'css') return 'css/[name]-[hash].[ext]'
          if (/(png|jpe?g|gif|svg|webp|ico)/.test(ext || ''))
            return 'images/[name]-[hash].[ext]'
          return 'assets/[name]-[hash].[ext]'
        },
      },
    },

    chunkSizeWarningLimit: 1000,
    minify: 'esbuild',
    sourcemap: false,
    target: 'es2015',
    cssCodeSplit: true,
    reportCompressedSize: true,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
  },

  server: {
    port: 3000,
    open: true,
  },
})
