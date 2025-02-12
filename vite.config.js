import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import glsl from "vite-plugin-glsl"; // 🔥 Importando o plugin GLSL

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), glsl()],
})
