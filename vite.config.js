import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // base: './' ensures assets are linked relatively, making it easier to deploy 
  // to GitHub Pages subdirectories without knowing the exact repo name beforehand.
  base: './', 
})
