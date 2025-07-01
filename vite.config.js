import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      port: 3001,
      open: true
    },
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    resolve: {
      alias: {
        '@': '/src',
        'components': '/src/components',
        'scenes': '/src/scenes',
        'state': '/src/state'
      }
    },
    define: {
      'process.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL)
    }
  }
})
