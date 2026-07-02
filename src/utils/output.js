import chalk from 'chalk'
import { table } from 'table'

export function printResults(results, engine, format = 'text') {
  if (!results || results.length === 0) {
    console.log(chalk.yellow('⚠ 未找到结果'))
    return
  }

  if (format === 'json') {
    console.log(JSON.stringify(results, null, 2))
    return
  }

  if (format === 'table') {
    const headers = [chalk.bold('序号'), chalk.bold('标题'), chalk.bold('链接')]
    const rows = results.map((r, i) => [
      chalk.gray(i + 1),
      r.title?.substring(0, 60) || '',
      chalk.blue(r.url?.substring(0, 80) || ''),
    ])
    console.log(table([headers, ...rows]))
    return
  }

  // 默认 text 格式
  console.log(chalk.cyan(`\n🔍 来源: ${engine} | 共 ${results.length} 条结果\n`))
  results.forEach((r, i) => {
    console.log(chalk.bold(`${i + 1}. ${r.title}`))
    if (r.url) console.log(chalk.blue(`   🔗 ${r.url}`))
    if (r.snippet) console.log(chalk.gray(`   ${r.snippet.substring(0, 200)}`))
    if (r.authors) console.log(chalk.gray(`   👤 ${r.authors}`))
    if (r.year) console.log(chalk.gray(`   📅 ${r.year}`))
    if (r.stars !== undefined) console.log(chalk.yellow(`   ⭐ ${r.stars}`))
    if (r.version) console.log(chalk.gray(`   📦 v${r.version}`))
    if (r.pubtime) console.log(chalk.gray(`   🕐 ${r.pubtime}`))
    console.log()
  })
}

export function printError(msg) {
  console.error(chalk.red(`✖ 错误: ${msg}`))
}

export function printSuccess(msg) {
  console.log(chalk.green(`✓ ${msg}`))
}

export function printInfo(msg) {
  console.log(chalk.cyan(`ℹ ${msg}`))
}
