import chalk from 'chalk'
import { getConfig } from '../utils/config.js'
import { printSuccess, printError } from '../utils/output.js'

export function registerConfig(program) {
  const config = program
    .command('config')
    .description('配置管理（API Key等）')
    .addHelpText('after', `
示例:
  flb config set tavily.key tvly-xxxxx
  flb config set exa.key 4b425c7f-xxxx
  flb config set github.token ghp_xxxxx
  flb config set google.key AIzaSyxxxxx
  flb config set google.cx 012345678xxx
  flb config set brave.key BSAxxxxx
  flb config list
  flb config get tavily.key
  flb config delete tavily.key
`)

  config
    .command('set <key> <value>')
    .description('设置配置项')
    .action((key, value) => {
      const cfg = getConfig()
      cfg.set(key, value)
      printSuccess(`已设置 ${key}`)
    })

  config
    .command('get <key>')
    .description('获取配置项')
    .action((key) => {
      const cfg = getConfig()
      const val = cfg.get(key)
      if (val === undefined) {
        printError(`配置项 "${key}" 不存在`)
      } else {
        const masked = String(val).length > 8
          ? String(val).substring(0, 4) + '****' + String(val).slice(-4)
          : '****'
        console.log(`${chalk.cyan(key)}: ${masked}`)
      }
    })

  config
    .command('list')
    .description('列出所有配置项')
    .action(() => {
      const cfg = getConfig()
      const all = cfg.store
      if (Object.keys(all).length === 0) {
        console.log(chalk.gray('暂无配置项'))
        return
      }
      Object.entries(all).forEach(([k, v]) => {
        const masked = String(v).length > 8
          ? String(v).substring(0, 4) + '****' + String(v).slice(-4)
          : '****'
        console.log(`${chalk.cyan(k)}: ${masked}`)
      })
    })

  config
    .command('delete <key>')
    .description('删除配置项')
    .action((key) => {
      const cfg = getConfig()
      cfg.delete(key)
      printSuccess(`已删除 ${key}`)
    })

  config
    .command('path')
    .description('显示配置文件路径')
    .action(() => {
      const cfg = getConfig()
      console.log(cfg.path)
    })
}
