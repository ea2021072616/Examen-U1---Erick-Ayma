import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/analizar-riesgos': 'http://localhost:5500',
      '/sugerir-tratamiento': 'http://localhost:5500',
      '/evaluar-activo-completo': 'http://localhost:5500',
      '/api': 'http://localhost:5500',
    }
  }
})
