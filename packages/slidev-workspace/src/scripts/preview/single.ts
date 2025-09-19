import fs from 'node:fs/promises'
import path from 'node:path'
import prompts from 'prompts'
import { execa } from 'execa'
import { findRootDir } from '../utils/findRootDir'

export async function runPreviewSingle(args: string[]) {
  const rootCwd = findRootDir()

  const folders = (await fs.readdir(path.resolve(rootCwd, 'slidevs'), { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
    .filter(folder => folder.match(/^\d{4}-/))
    .sort((a, b) => -a.localeCompare(b))

  const result = args.includes('-y')
    ? { folder: folders[0] }
    : await prompts([
        {
          type: 'select',
          name: 'folder',
          message: 'Pick a folder',
          choices: folders.map(folder => ({ title: folder, value: folder })),
        },
      ])

  args = args.filter(arg => arg !== '-y')

  if (result.folder) {
    await execa('pnpm', ['run', ...args], {
      cwd: path.resolve(rootCwd, 'slidevs', result.folder),
      stdio: 'inherit',
    })
  }
}
