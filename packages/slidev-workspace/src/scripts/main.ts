import { runPreviewAll, runPreviewSingle } from './preview/index'
import { runBuild } from './build/index'

const args = process.argv.slice(2)
const command = args[0]

function showHelp() {
  console.log(`
Slidev Workspace - A tool for managing multiple Slidev presentations

Usage:
  slidev-workspace <command> [options]

Commands:
  preview:dev     Start the single slidev development server
  preview:build   Build the single slidev to package
  preview:all     Build all slides and preview app gather
  build   Build the Slidev Workspace project for production
  help    Show this help message

Examples:
  slidev-workspace preview:dev                            # Start development server
  slidev-workspace preview:build                          # Build the single slidev to package
  slidev-workspace preview:export                         # Export the single slidev to package
  slidev-workspace preview:all                            # Build all slides and preview app
  slidev-workspace build --mode=default                   # Build the Slidev Workspace project for production with default mode
  slidev-workspace build --mode=ipfs                      # Build the Slidev Workspace project for production with ipfs mode

Configuration:
  Use slidev-workspace.yml to set baseUrl for all builds
`)
}

async function main() {
  console.log(command, 'commandcommand')
  switch (command) {
    case 'preview:dev':
      await runPreviewSingle(['dev'])
      break

    case 'preview:export':
      await runPreviewSingle(['export'])
      break

    case 'preview:build':
      await runPreviewSingle(['build'])
      break

    case 'preview:all':
      await runPreviewAll()
      break

    case 'build':
      // eslint-disable-next-line no-case-declarations
      const modeArg = args.find(arg => arg.startsWith('--mode='))
      // eslint-disable-next-line no-case-declarations
      const mode = modeArg ? modeArg.split('=')[1] : 'default'
      await runBuild(mode as 'default' | 'ipfs')
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
