import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'electron' ? './' : '/',
  build: {
    outDir: mode === 'electron' ? 'dist-electron' : 'dist',
  },
  plugins: [react()],
}))
