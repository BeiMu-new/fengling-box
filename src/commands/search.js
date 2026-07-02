import chalk from 'chalk'
import ora from 'ora'
import { writeFileSync } from 'fs'
import { getEngine, listEngines, engines } from '../engines/index.js'
import { printResults, printError, printInfo, printSuccess } from '../utils/output.js'
import { table } from 'table'
import { addHistory, getHistory, clearHistory } from '../utils/history.js'

function toMarkdown(results, engine, query) {
  const lines = [`# ${engine} 搜索: ${query}`, '', `共 ${results.length} 条结果`, '']
  results.forEach((r, i) => {
    lines.push(`## ${i + 1}. ${r.title}`)
    if (r.url) lines.push(`- 链接：${r.url}`)
    if (r.snippet) lines.push(`- 摘要：${r.snippet}`)
    if (r.authors) lines.push(`- 作者：${r.authors}`)
    if (r.year) lines.push(`- 年份：${r.year}`)
    if (r.stars !== undefined) lines.push(`- Stars：${r.stars}`)
    if (r.version) lines.push(`- 版本：${r.version}`)
    if (r.pubtime) lines.push(`- 发布时间：${r.pubtime}`)
    lines.push('')
  })
  return lines.join('\n')
}

async function runSearch(engineName, query, opts) {
  const limit = parseInt(opts.limit) || 10
  const spinner = ora(`正在搜索 [${engineName}]: ${query}`).start()
  try {
    const engine = getEngine(engineName)
    const results = await engine.search(query, { limit, type: opts.type })
    spinner.stop()
    addHistory(engineName, query)
    // 输出文件
    if (opts.out) {
      const ext = opts.out.toLowerCase().split('.').pop()
      let content
      if (ext === 'json') content = JSON.stringify(results, null, 2)
      else if (ext === 'md' || ext === 'markdown') content = toMarkdown(results, engineName, query)
      else content = results.map((r, i) => `${i + 1}. ${r.title}\n   ${r.url}\n   ${r.snippet || ''}\n`).join('\n')
      writeFileSync(opts.out, content, 'utf-8')
      printSuccess(`已导出 ${results.length} 条结果到 ${opts.out}`)
      return results
    }
    printResults(results, engineName, opts.format)
    return results
  } catch (err) {
    spinner.stop()
    printError(`[${engineName}] ${err.message}`)
    return null
  }
}

export function registerSearch(program) {
  const search = program
    .command('search')
    .description('多源聚合搜索（用户显式选择搜索源）')
    .argument('[engine]', '搜索源名称，输入 engines 列出所有可用源，输入 history 查看搜索历史')
    .argument('[query...]', '搜索关键词')
    .option('-l, --limit <n>', '返回结果数量', '10')
    .option('-f, --format <fmt>', '输出格式: text/json/table', 'text')
    .option('-t, --type <type>', '搜索类型（部分搜索源支持）')
    .option('-o, --out <file>', '导出结果到文件（.json/.md/.txt）')
    .option('-e, --engines <engines>', '多引擎并行搜索（逗号分隔，如 baidu,bing,github）')
    .option('--detail', '显示详细信息（配合 engines 使用）')
    .addHelpText('after', `
示例:
  flb search baidu "OpenCode Go使用教程"
  flb search github "qwen coder" --limit 5
  flb search bilibili "Flux.2 Klein" --type video
  flb search arxiv "speculative decoding" --out result.md
  flb search all "AI大模型" -e baidu,bing,github
  flb search history
  flb search engines
  flb search engines --detail
`)
    .action(async (engineName, queryParts, opts) => {
      // 列出所有可用引擎
      if (!engineName || engineName === 'engines') {
        const list = listEngines()
        if (opts.detail) {
          const headers = [
            chalk.bold('名称'),
            chalk.bold('说明'),
            chalk.bold('需要Key'),
            chalk.bold('稳定性'),
          ]
          const rows = list.map(e => [
            chalk.cyan(e.name),
            e.description,
            e.requiresKey ? chalk.yellow('*') : chalk.green('✗'),
            e.stability === 'stable' ? chalk.green('稳定') :
              e.stability === 'unstable' ? chalk.yellow('不稳定') :
              chalk.red('实验性'),
          ])
          console.log(table([headers, ...rows]))
        } else {
          const names = list.map(e => chalk.cyan(e.name)).join(', ')
          console.log(chalk.bold(`\n可用搜索源（${list.length}个）:\n`))
          console.log(names)
          console.log(chalk.gray('\n使用 --detail 查看详细信息\n'))
        }
        return
      }

      // 查看历史
      if (engineName === 'history') {
        if (queryParts[0] === 'clear') {
          clearHistory()
          printSuccess('搜索历史已清空')
          return
        }
        const history = getHistory(parseInt(opts.limit) || 20)
        if (history.length === 0) {
          printInfo('暂无搜索历史')
          return
        }
        console.log(chalk.bold(`\n最近 ${history.length} 条搜索记录:\n`))
        history.forEach((h, i) => {
          const time = new Date(h.time).toLocaleString()
          console.log(`${chalk.gray(i + 1)}. ${chalk.cyan(h.engine)} ${chalk.gray('|')} ${h.query} ${chalk.gray('(' + time + ')')}`)
        })
        console.log(chalk.gray('\n提示: flb search history clear 清空历史\n'))
        return
      }

      const query = queryParts.join(' ')
      if (!query) return printError('请输入搜索关键词')

      // 多引擎并行搜索
      if (engineName === 'all' || opts.engines) {
        const engineList = (opts.engines || '').split(',').map(s => s.trim()).filter(Boolean)
        if (engineList.length === 0) return printError('多引擎搜索需要 --engines 参数，如: -e baidu,bing,github')
        console.log(chalk.bold(`\n🔍 多引擎并行搜索: ${query}`))
        console.log(chalk.gray(`引擎: ${engineList.join(', ')}\n`))
        const results = await Promise.all(engineList.map(async name => {
          try {
            const engine = getEngine(name)
            const res = await engine.search(query, { limit: parseInt(opts.limit) || 10 })
            return { engine: name, results: res, error: null }
          } catch (e) {
            return { engine: name, results: [], error: e.message }
          }
        }))
        // 汇总输出
        const allResults = []
        results.forEach(r => {
          if (r.error) {
            console.log(chalk.red(`\n✖ [${r.engine}] ${r.error}`))
          } else {
            console.log(chalk.cyan(`\n━━ [${r.engine}] ${r.results.length} 条 ━━`))
            r.results.slice(0, 3).forEach((item, i) => {
              console.log(`  ${i + 1}. ${item.title}`)
              if (item.url) console.log(chalk.blue(`     ${item.url}`))
            })
            r.results.forEach(item => allResults.push({ ...item, _source: r.engine }))
          }
        })
        if (opts.out) {
          const ext = opts.out.toLowerCase().split('.').pop()
          const content = ext === 'json' ? JSON.stringify(results, null, 2) : allResults.map(r => `[${r._source}] ${r.title}\n  ${r.url}`).join('\n\n')
          writeFileSync(opts.out, content, 'utf-8')
          printSuccess(`\n已导出所有结果到 ${opts.out}`)
        }
        addHistory('multi:' + engineList.join(','), query)
        return
      }

      // 单引擎搜索
      await runSearch(engineName, query, opts)
    })

  // 直接 flb search <engine> <query> 形式
  program.hook('preSubcommand', (thisCommand, subCommand) => {})
}
