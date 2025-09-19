import path from 'path'
import fs from 'fs'

export function findRootDir() {
  let current = process.cwd()
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, 'pnpm-workspace.yaml'))) {
      return current
    }
    current = path.dirname(current)
  }
  return process.cwd()
}
