import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Tell Vite to ignore chunks under 600kB (perfect for apps using MUI/WebRTC)
    chunkSizeWarningLimit: 600,
  }
})

