import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { parse } from 'node:url'
import type { Plugin } from 'vite'
import { resolveSlidesDirs } from '../scripts/utils/config'

const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

// 静态文件服务插件
export function staticFilePlugin(workspaceCwd: string, config: any): Plugin {
  return {
    name: 'static-file-server',
    configureServer(server: any) {
      const baseUrl = config.baseUrl?.startsWith('/') ? config.baseUrl.slice(1) : config.baseUrl
      const slidesDirs = resolveSlidesDirs(config, workspaceCwd)
      const slideDistMap = new Map<string, string>()

      // 构建幻灯片目录映射
      for (const slidesDir of slidesDirs) {
        if (!existsSync(slidesDir)) continue

        const slides = readdirSync(slidesDir, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory())
          .map(dirent => dirent.name)

        for (const slideName of slides) {
          const slideDistDir = resolve(slidesDir, slideName, 'dist')
          if (existsSync(slideDistDir)) {
            slideDistMap.set(slideName, slideDistDir)
          }
        }
      }

      server.middlewares.use((req: any, res: any, next: any) => {
        const url = parse(req.url || '', true)
        const pathname = url.pathname || ''

        // 检查是否是预览路径
        const previewMatch = pathname.match(new RegExp(`^/${baseUrl}/([\\d\\-]+)(/.*)?$`))

        if (previewMatch) {
          const [pathname, slideName] = previewMatch
          const distDir = slideDistMap.get(slideName)

          const assetPreviewMatch = pathname.match(new RegExp(`^/${baseUrl}/(\\d{4}-\\d{2}-\\d{2})/assets/.+$`))

          if (assetPreviewMatch) {
            const [slidevPathName] = pathname.match(/\/assets\/(.*)$/)
            const dateStr: string | undefined = assetPreviewMatch[1]
            const content = readFileSync(join(slideDistMap.get(dateStr)!, slidevPathName), 'utf8').replace(
              /assets\//g,
              `${baseUrl}/${dateStr}/assets/`,
            )

            const ext = extname(slidevPathName)
            res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
            res.end(content)
            return
          }

          // 处理入口文件
          if (distDir) {
            const targetPath = resolve(distDir, 'index.html')

            try {
              if (existsSync(targetPath)) {
                const content = readFileSync(targetPath, 'utf8')
                  .replace(/href="\/assets\//g, `href="/${baseUrl}/${slideName}/assets/`)
                  .replace(/src="\/assets\//g, `src="/${baseUrl}/${slideName}/assets/`)
                const ext = extname(targetPath)

                res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
                res.end(content)
                return
              }
            } catch (error) {
              console.error('Error serving file:', error)
            }
          }
        }

        next()
      })
    },
  }
}
