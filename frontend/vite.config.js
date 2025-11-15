// vite.config.js
import { defineConfig } from 'vite' // <-- DÒNG NÀY BẮT BUỘC PHẢI CÓ
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Cổng chạy frontend
  }
})