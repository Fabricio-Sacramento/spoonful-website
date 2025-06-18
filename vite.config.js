import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import glsl from 'vite-plugin-glsl'
import devtoolsJson from 'vite-plugin-devtools-json'
import cssExtract from 'rollup-plugin-css-only'

export default defineConfig({
  plugins: [
    devtoolsJson(),                                 // só no dev e build
    react(),
    glsl(),
    cssExtract({
      output: 'styles/style.css',
      apply: 'build'                                // ← somente em build
    })
  ],
  css: {
    devSourcemap: true
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'styles/[name][extname]'    // mantém /styles/style.css em prod
      }
    }
  }
})
