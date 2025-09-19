import { createServer } from 'vite'
import { createViteConfig } from '../utils/createViteConfig'
import { staticFilePlugin } from '../../vite/static-file-server'
import { findRootDir } from '../utils/findRootDir'
import { loadConfig } from '../utils/config'

export async function runPreviewAll() {
  const cwd = findRootDir()
  try {
    const config = createViteConfig([staticFilePlugin(cwd, loadConfig(cwd))])
    const server = await createServer(config)
    await server.listen()
    server.printUrls()
  } catch (error) {
    console.error('❌ Development server failed:', error)
    process.exit(1)
  }
}
