import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - separate React and other libraries
          'vendor-react': ['react', 'react-dom'],
          'vendor-lucide': ['lucide-react'],
          
          // Feature chunks - separate by functionality
          'feature-dashboard': [
            './src/components/TravelerDashboard.tsx',
            './src/components/DestinationDetailsModal.tsx'
          ],
          'feature-api': ['./src/services/api.ts'],
          
          // Route chunks (if you add routing later)
          'routes': ['./src/App.tsx', './src/main.tsx'],
        },
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk'
          return `js/${facadeModuleId}-[hash].js`
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(css)$/.test(assetInfo.name || '')) {
            return `css/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1MB
    minify: 'esbuild', // Use esbuild for faster builds
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    target: 'es2015', // Target modern browsers for better tree shaking
    cssCodeSplit: true, // Split CSS into chunks
    reportCompressedSize: true, // Report compressed sizes
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react'],
    exclude: [], // Exclude any problematic dependencies
  },
  server: {
    port: 3000,
    open: true,
  },
  // Add build analysis
  plugins: [
    react(),
    // Add bundle analyzer in development
    process.env.ANALYZE && {
      name: 'bundle-analyzer',
      apply: 'build',
      generateBundle(options, bundle) {
        const sizes = {}
        for (const [fileName, chunk] of Object.entries(bundle)) {
          if (chunk.type === 'chunk') {
            sizes[fileName] = chunk.code.length
          }
        }
        console.log('📊 Bundle Analysis:', sizes)
      }
    }
  ].filter(Boolean),
})
