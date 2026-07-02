import { Command } from 'commander'
import { registerSearch } from './commands/search.js'
import { registerFile } from './commands/file.js'
import { registerImage } from './commands/image.js'
import { registerVerify } from './commands/verify.js'
import { registerData } from './commands/data.js'
import { registerConfig } from './commands/config.js'
import { registerTool } from './commands/tool.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const pkg = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'))

export function createProgram() {
  const program = new Command()

  program
    .name('flb')
    .description('枫铃工具箱 fengling-box — 多功能命令行工具箱')
    .version(pkg.version)

  registerSearch(program)
  registerFile(program)
  registerImage(program)
  registerVerify(program)
  registerData(program)
  registerConfig(program)
  registerTool(program)

  return program
}
