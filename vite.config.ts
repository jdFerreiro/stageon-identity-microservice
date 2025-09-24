import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // La carpeta de salida será "dist" dentro de "identity-microservice"
    lib: {
      entry: 'src/index.ts',
      name: 'IdentityMicroservice',
      fileName: (format) => `identity-microservice.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react', 'react-dom', '@mui/material', '@mui/icons-material', 'axios'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@mui/material': 'MaterialUI',
          '@mui/icons-material': 'MaterialUIIcons',
          axios: 'axios'
        }
      }
    }
  }
})
