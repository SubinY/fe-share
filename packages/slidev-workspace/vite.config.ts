import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import { loadConfig } from './src/scripts/config'
import { slidesPlugin } from './src/vite/plugin-slides'

const workspaceCwd = process.env.SLIDEV_WORKSPACE_CWD || process.cwd()
const config = loadConfig(workspaceCwd)

export default defineConfig({
  root: './src/preview',
  plugins: [vue(), tailwindcss(), slidesPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src/preview'),
    },
  },
  build: {
    outDir: resolve(workspaceCwd, config.outputDir),
  },
  server: {
    port: 3000,
    open: true,
  },
})
