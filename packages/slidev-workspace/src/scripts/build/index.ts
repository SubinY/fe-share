import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import path, { join, resolve } from 'node:path'
import { build } from 'vite'
import { loadConfig, resolveSlidesDirs } from '../utils/config'
import { createViteConfig } from '../utils/createViteConfig'
import { findRootDir } from '../utils/findRootDir'

type Mode = 'default' | 'ipfs'

async function buildAllSlides() {
  return new Promise((resolve, reject) => {
    const workspaceCwd = findRootDir()
    const config = loadConfig(workspaceCwd)
    const slidesDirs = resolveSlidesDirs(config, workspaceCwd)
    const slidesRaws = []

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
        // if (existsSync(distPath)) {
        //   console.warn(`⚠️ Skipping ${slideName}: dist dir found`)
        //   slidesRaws.push({ name: slideName, dir: path.resolve(workspaceCwd, 'slidevs', slideName) })
        //   continue
        // }

        console.log(`📦 Building slide: ${slideName}`)

        try {
          const buildCmd = `pnpm --filter "./slidevs/${slideName}" run build --base /${slideName}/`

          execSync(buildCmd, {
            cwd: workspaceCwd,
            stdio: 'inherit',
          })
          slidesRaws.push({ name: slideName, dir: path.resolve(workspaceCwd, 'slidevs', slideName) })
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

async function copySlideDistToWorkspace(slide: { name: string; dir: string }, outRoot: string) {
  const from = resolve(slide.dir, 'dist')
  const to = resolve(outRoot, slide.name)

  if (!existsSync(from)) return

  mkdirSync(outRoot, { recursive: true })
  await cp(from, to, { recursive: true })

  // const rootIndex = join(to, 'index.html')
  // if (existsSync(rootIndex)) {
  //   const html = readFileSync(rootIndex, 'utf-8')
  //   writeFileSync(rootIndex, rewriteHtmlContent(html, slide.name))
  // }
}

function rewriteHtmlContent(html: string, slug?: string) {
  let output = html
  // 根页面：/assets/ -> assets/
  output = output.replace(/(href|src)="\/assets\//g, '$1="assets/')
  if (slug) {
    // 子目录页面：/slug/assets/ -> assets/
    const escaped = slug.replace(/[-/\\]/g, m => `\\${m}`)
    const pattern = new RegExp(`(href|src)="\/${escaped}\/assets\/`, 'g')
    output = output.replace(pattern, '$1="assets/')
  }
  return output
}

function writeRedirectHtml(targetDir: string, redirectTo: string) {
  const html = `
  <!doctype html>
<html>
  <head>
    <meta http-equiv="refresh" content="0; url=${redirectTo}" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Redirecting…</title>
    <script>
      location.replace('${redirectTo}')
    </script>
  </head>
  <body>
   <a href="${redirectTo}">Redirecting to ${redirectTo}</a>
  </body>
</html>
`
  mkdirSync(targetDir, { recursive: true })
  writeFileSync(join(targetDir, 'index.html'), html)
}

function genRedirectDir(viteConfig: any, mode: Mode) {
  const { build, base } = viteConfig
  const outRoot = build.outDir
  // 处理根 index.html
  const rootIndex = join(outRoot, 'index.html')
  if (existsSync(rootIndex)) {
    const html = readFileSync(rootIndex, 'utf-8')
    writeFileSync(rootIndex, rewriteHtmlContent(html))
  }

  // 遍历一级子目录
  const entries = readdirSync(outRoot, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const name = entry.name

    // 跳过不是以 0000-00-00 格式 开头的目录
    if (!name.match(/^\d{4}-\d{2}-\d{2}/)) continue

    const dir = join(outRoot, name)
    for (const file of ['index.html', '404.html']) {
      const p = join(dir, file)
      if (!existsSync(p) || !statSync(p).isFile()) continue
      const html = readFileSync(p, 'utf-8')
      writeFileSync(p, rewriteHtmlContent(html, name))
    }
    // 生成 preview 重定向页
    const previewDir = join(outRoot, base, name)
    writeRedirectHtml(previewDir, mode === 'ipfs' ? `../../${name}/` : `../../${name}/index.html`)
  }
}

async function copyToGhPages() {
  const workspaceCwd = findRootDir()
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

export async function runBuild(mode: 'default' | 'ipfs') {
  try {
    const slidesRaws = await buildAllSlides()
    const config = createViteConfig()
    // 特殊处理，dist/index.html 的 base 需要是 /，不能在上方添加，否则会导致重定向失败
    await build({ ...config, base: '/' })

    for (const slide of slidesRaws as any[]) {
      await copySlideDistToWorkspace(slide, config.build.outDir)
    }
    genRedirectDir(config, mode)

    // Copy everything to _gh-pages
    // await copyToGhPages()

    console.log('✅ Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}
