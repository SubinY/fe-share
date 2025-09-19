#!/usr/bin/env node

import { fileURLToPath } from 'node:url'
import path, { dirname, join, resolve, extname } from 'node:path'
import { readdirSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import { execSync } from 'node:child_process'
import { build, createServer } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { parse } from 'url'

import { slidesPlugin } from './vite/plugin-slides'
import { loadConfig, resolveSlidesDirs } from './scripts/utils/config'
import { buildAll } from './build/build-all'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const args = process.argv.slice(2)
const command = args[0]

const packageRoot = join(__dirname, '..')

// 设置正确的 Content-Type
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

function createViteConfig() {
  const workspaceCwd = process.env.SLIDEV_WORKSPACE_CWD || process.cwd()
  const config = loadConfig(workspaceCwd)

  const plugins = [vue(), tailwindcss(), slidesPlugin()]
  let base = '/'
  if (args[0] === 'preview') {
    plugins.push(createStaticFilePlugin(workspaceCwd, config))
    base = config.baseUrl
  }

  return {
    root: resolve(packageRoot, 'src/preview'),
    base,
    plugins,
    resolve: {
      alias: {
        '@': resolve(packageRoot, 'src/preview'),
      },
    },
    build: {
      outDir: resolve(workspaceCwd, config.outputDir),
    },
    server: {
      port: 3000,
      open: true,
    },
  }
}

// 创建静态文件服务插件
function createStaticFilePlugin(workspaceCwd: string, config: any) {
  return {
    name: 'static-file-server',
    configureServer(server: any) {
      const slidesDirs = resolveSlidesDirs(config, workspaceCwd)
      const slideDistMap = new Map<string, string>()
      console.log(slidesDirs, 'slidesDirs123')
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
        const previewMatch = pathname.match(/^\/preview\/([\d\-]+)(\/.*)?$/)
        if (previewMatch) {
          const [pathname, slideName] = previewMatch
          const distDir = slideDistMap.get(slideName)

          // 用正则提取出 /preview/0000-00-00/assets/xxx 的 0000-00-00
          const assetPreviewMatch = pathname.match(/^\/preview\/([\d]{4}-[\d]{2}-[\d]{2})\/assets\/.+$/)
          if (assetPreviewMatch) {
            const [slidevPathName] = pathname.match(/\/assets\/(.*)$/)
            const dateStr: string | undefined = assetPreviewMatch[1]
            const content = readFileSync(join(slideDistMap.get(dateStr)!, slidevPathName), 'utf8').replace(
              /assets\//g,
              `preview/${dateStr}/assets/`,
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
                  .replace(/href="\/assets\//g, `href="/preview/${slideName}/assets/`)
                  .replace(/src="\/assets\//g, `src="/preview/${slideName}/assets/`)
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

async function buildAllSlides() {
  return new Promise((resolve, reject) => {
    const workspaceCwd = process.env.SLIDEV_WORKSPACE_CWD || process.cwd()
    const config = loadConfig(workspaceCwd)
    const slidesDirs = resolveSlidesDirs(config, workspaceCwd)
    const slidesRaws = []

    console.log('🔨 Building all slides...')

    for (const slidesDir of slidesDirs) {
      if (!existsSync(slidesDir)) {
        console.warn(`⚠️ Slides directory not found: ${slidesDir}`)
        continue
      }

      const slides = readdirSync(slidesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name)

      for (const slideName of slides) {
        const slideDir = join(slidesDir, slideName)
        const packageJsonPath = join(slideDir, 'package.json')
        const distPath = join(slideDir, 'dist')

        if (!existsSync(packageJsonPath)) {
          console.warn(`⚠️ Skipping ${slideName}: no package.json found`)
          continue
        }
        if (existsSync(distPath)) {
          console.warn(`⚠️ Skipping ${slideName}: dist dir found`)
          continue
        }

        console.log(`📦 Building slide: ${slideName}`)

        try {
          // Use execSync to run pnpm build command for each slide
          const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl : config.baseUrl + '/'
          const buildCmd = `pnpm --filter "./slidevs/${slideName}" run build --base /${slideName}/`
          // console.log(workspaceCwd, path.resolve(workspaceCwd, '../..'), 'workspaceCwd123')
          execSync(buildCmd, {
            cwd: path.resolve(workspaceCwd, '../..'),
            stdio: 'inherit',
          })
          slidesRaws.push({ name: slideName, dir: path.resolve(workspaceCwd, '../..', 'slidevs', slideName) })
          console.log(`✅ Built slide: ${slideName}`)
        } catch (error) {
          console.error(`❌ Failed to build slide ${slideName}:`, error)
          process.exit(1)
        }
      }
    }

    resolve(slidesRaws)
  })
}

async function copyToGhPages() {
  const workspaceCwd = process.env.SLIDEV_WORKSPACE_CWD || process.cwd()
  const config = loadConfig(workspaceCwd)
  const slidesDirs = resolveSlidesDirs(config, workspaceCwd)
  const ghPagesDir = join(workspaceCwd, '_gh-pages')

  console.log('📁 Copying files to _gh-pages directory...')

  // Create _gh-pages directory if it doesn't exist
  if (!existsSync(ghPagesDir)) {
    mkdirSync(ghPagesDir, { recursive: true })
  }

  // Copy slides
  for (const slidesDir of slidesDirs) {
    if (!existsSync(slidesDir)) continue

    const slides = readdirSync(slidesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

    for (const slideName of slides) {
      const slideDistDir = join(slidesDir, slideName, 'dist')
      const targetDir = join(ghPagesDir, slideName)

      if (existsSync(slideDistDir)) {
        console.log(`📋 Copying ${slideName} to _gh-pages...`)
        await cp(slideDistDir, targetDir, { recursive: true })
      }
    }
  }

  // Copy preview app as index
  const previewDistDir = join(workspaceCwd, config.outputDir)
  if (existsSync(previewDistDir)) {
    console.log('📋 Copying preview app as index...')
    await cp(previewDistDir, ghPagesDir, { recursive: true })
  }

  console.log('✅ All files copied to _gh-pages successfully!')
}

// prettier-ignore
async function copySlideDistToWorkspace(slide: { name: string, dir: string }, outRoot: string) {
  const from = resolve(slide.dir, 'dist')
  const to = resolve(outRoot, slide.name)
  console.log(from, to)
  if (!existsSync(from)) return
  mkdirSync(outRoot, { recursive: true })
  await cp(from, to, { recursive: true })
}

async function runViteBuild() {
  try {
    const slidesRaws = await buildAllSlides()
    console.log('📦 Building Slidev Workspace for production...')
    const config = createViteConfig()
    await build(config)
    for (const slide of slidesRaws) {
      await copySlideDistToWorkspace(slide, config.build.outDir)
    }

    // Copy everything to _gh-pages
    // await copyToGhPages()

    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

async function runWorkspaceBuild() {
  try {
    console.log('📦 Building all slides to root dist...')
    await runViteBuild()
    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

async function runVitePreview() {
  try {
    console.log('🚀 Starting Slidev Workspace development server...')
    const config = createViteConfig()
    const server = await createServer(config)
    await server.listen()
    server.printUrls()
  } catch (error) {
    console.error('❌ Development server failed:', error)
    process.exit(1)
  }
}

function showHelp() {
  console.log(`
Slidev Workspace - A tool for managing multiple Slidev presentations

Usage:
  slidev-workspace <command> [options]

Commands:
  dev     Start the development server
  build   Build the project for production
  help    Show this help message

Examples:
  slidev-workspace dev                                    # Start development server
  slidev-workspace build                                  # Build all slides and preview app

Configuration:
  Use slidev-workspace.yml to set baseUrl for all builds

For more information, visit: https://github.com/author/slidev-workspace
`)
}

async function main() {
  switch (command) {
    case 'dev':
      break

    case 'preview':
      // Set the working directory for the configuration system
      process.env.SLIDEV_WORKSPACE_CWD = process.cwd()
      await runVitePreview()
      break

    case 'build':
      // Set the working directory for the configuration system
      process.env.SLIDEV_WORKSPACE_CWD = process.cwd()
      await runWorkspaceBuild()
      break

    case 'help':
    case '--help':
    case '-h':
      showHelp()
      break

    default:
      if (!command) {
        showHelp()
      } else {
        console.error(`Unknown command: ${command}`)
        console.error('Run "slidev-workspace help" for available commands.')
        process.exit(1)
      }
  }
}

main().catch(error => {
  console.error('❌ An error occurred:', error)
  process.exit(1)
})

// server {
//   listen       5000;
//   server_name  chemistry-web;

//   # 处理具体的 slide 路径，如 /preview/0000-00-00
//   location ~ ^/preview/([^/]+)/?$ {
//       alias E:\study\fe-share\dist/$1;
//       try_files $uri $uri/ /$1/index.html;
//       index index.html;
//   }

//   # 处理 slide 内的静态资源，如 /preview/0000-00-00/assets/...
//   location ~ ^/preview/([^/]+)/(.+)$ {
//       alias E:\study\fe-share\dist/$1/$2;
//       try_files $uri =404;
//   }

//   # 处理根路径的静态资源 - 修改这个规则
//   location /assets/ {
//       alias E:\study\fe-share\dist/assets/;
//       expires 1y;
//       add_header Cache-Control "public, immutable";
//   }

//   # 处理 /preview 路径，指向 dist 目录
//   location / {
//       root E:\study\fe-share\dist;
//       try_files $uri /index.html;
//       index index.html;
//   }
// }
