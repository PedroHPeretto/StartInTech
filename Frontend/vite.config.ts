import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  envDir: path.resolve(import.meta.dirname, '..'),
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss()
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@startintech/shared": path.resolve(
        import.meta.dirname,
        "../shared/dist/index.js",
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['storybook/viewport'],
  },
})
