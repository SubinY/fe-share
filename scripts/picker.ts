import fs from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'
import { execa } from 'execa'

async function startPicker(args: string[]) {
  const folders = (await fs.readdir(path.resolve(process.cwd(), 'slidevs'), { withFileTypes: true }))
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
    if (args[0] === 'dev') {
      const editor = process.env.PICKER_EDITOR
      if (editor) {
        console.log(`use editor ${editor} by env PICKER_EDITOR`)
        execa(editor, [fileURLToPath(new URL(`../${result.folder}/src/slides.md`, import.meta.url))])
      }
    }

    await execa('pnpm', ['run', ...args], {
      cwd: path.resolve(process.cwd(), 'slidevs', result.folder, 'src'),
      stdio: 'inherit',
    })
  }
}

await startPicker(process.argv.slice(2))
