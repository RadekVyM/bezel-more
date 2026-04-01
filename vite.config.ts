import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
// import viteCompression from 'vite-plugin-compression2'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/bezel-more/',
  plugins: [
    react(),
    tailwindcss(),
    /*
    viteCompression({
      include: /\.(js|wasm)$/i,
    })
    */
  ],
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
