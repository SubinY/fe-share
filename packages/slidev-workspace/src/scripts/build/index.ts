import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync } from 'node:fs'
import { cp } from 'node:fs/promises'
import path, { join, resolve } from 'node:path'
import { build } from 'vite'
import { loadConfig, resolveSlidesDirs } from '../utils/config'
import { createViteConfig } from '../utils/createViteConfig'
import { findRootDir } from '../utils/findRootDir'

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

export async function runBuild() {
  try {
    const slidesRaws = await buildAllSlides()
    const config = createViteConfig([], { base: '/' })
    await build(config)

    for (const slide of slidesRaws as any[]) {
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
