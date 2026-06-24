import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use './' for relative asset paths when self-hosting (uploading dist/ folder)
  // Change to '/' if deploying to Vercel/Netlify at domain root
  base: './',
})
