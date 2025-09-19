import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import type { Plugin } from 'vite'
import { slidesPlugin } from '../../vite/plugin-slides'
import { loadConfig } from './config'

export function createViteConfig(plugins: Plugin[] = [], options: Record<string, any> = {}) {
  const config = loadConfig()

  const pluginRaw = [vue(), tailwindcss(), slidesPlugin(), ...plugins]
  const base = config.baseUrl

  return {
    root: resolve(process.cwd(), 'src/preview'),
    base,
    plugins: pluginRaw,
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src/preview'),
      },
    },
    build: {
      outDir: resolve(config.projectRoot, config.outputDir),
    },
    server: {
      port: 3000,
      open: true,
    },
    ...options,
  }
}
