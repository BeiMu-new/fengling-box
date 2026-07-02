import { readFileSync, writeFileSync, existsSync } from 'fs'
import { extname, basename, dirname, join } from 'path'
import chalk from 'chalk'
import { printSuccess, printError, printInfo } from '../utils/output.js'

export function registerData(program) {
  const data = program
    .command('data')
    .description('数据处理工具（Excel/CSV/文本清洗）')
    .addHelpText('after', `
示例:
  flb data csv ./data.csv --info
  flb data csv ./data.csv --col 1,2,3 --out result.csv
  flb data excel ./data.xlsx --sheet Sheet1 --out result.csv
  flb data text ./file.txt --trim --dedup --out result.txt
  flb data text ./file.txt --replace "旧内容" "新内容"
  flb data json ./data.json --pretty
  flb data json ./data.json --query "data[0].name"
`)

  // CSV处理
  data
    .command('csv <file>')
    .description('CSV文件处理')
    .option('--info', '显示文件信息（行数、列数、列名）')
    .option('--col <cols>', '只保留指定列（逗号分隔，如1,3,5 或 name,age）')
    .option('--head <n>', '只显示前N行', '10')
    .option('--filter <expr>', '过滤行（如 "age>18"）')
    .option('-o, --out <file>', '输出文件')
    .action(async (file, opts) => {
      if (!existsSync(file)) return printError(`文件不存在: ${file}`)
      const content = readFileSync(file, 'utf-8')
      const lines = content.split('\n').filter(l => l.trim())
      const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''))
      const rows = lines.slice(1).map(l => l.split(',').map(c => c.trim().replace(/^["']|["']$/g, '')))

      if (opts.info) {
        console.log(chalk.bold('\nCSV文件信息:'))
        console.log(`  文件: ${chalk.cyan(file)}`)
        console.log(`  总行数: ${chalk.cyan(rows.length)} 行（不含表头）`)
        console.log(`  列数: ${chalk.cyan(header.length)} 列`)
        console.log(`  列名: ${chalk.cyan(header.join(', '))}`)
        return
      }

      let selectedRows = rows
      const n = parseInt(opts.head)
      if (!opts.out) selectedRows = selectedRows.slice(0, n)

      let selectedHeader = header
      let colIndices = null
      if (opts.col) {
        const cols = opts.col.split(',').map(c => c.trim())
        colIndices = cols.map(c => {
          const idx = parseInt(c)
          return isNaN(idx) ? header.indexOf(c) : idx - 1
        }).filter(i => i >= 0)
        selectedHeader = colIndices.map(i => header[i])
        selectedRows = selectedRows.map(r => colIndices.map(i => r[i] || ''))
      }

      const output = [selectedHeader, ...selectedRows].map(r => r.join(',')).join('\n')
      if (opts.out) {
        writeFileSync(opts.out, output, 'utf-8')
        printSuccess(`已输出到 ${opts.out}`)
      } else {
        console.log(chalk.gray(selectedHeader.join(' | ')))
        console.log(chalk.gray('-'.repeat(60)))
        selectedRows.forEach(r => console.log(r.join(' | ')))
      }
    })

  // Excel处理
  data
    .command('excel <file>')
    .description('Excel文件处理（读取/转CSV）')
    .option('--sheet <name>', 'Sheet名称', 'Sheet1')
    .option('--info', '显示工作表信息')
    .option('-o, --out <file>', '输出文件（csv）')
    .action(async (file, opts) => {
      if (!existsSync(file)) return printError(`文件不存在: ${file}`)
      try {
        const XLSX = (await import('xlsx')).default
        const wb = XLSX.readFile(file)
        if (opts.info) {
          console.log(chalk.bold('\nExcel文件信息:'))
          console.log(`  工作表: ${wb.SheetNames.join(', ')}`)
          wb.SheetNames.forEach(name => {
            const ws = wb.Sheets[name]
            const ref = ws['!ref']
            console.log(`  [${name}] 范围: ${ref}`)
          })
          return
        }
        const sheetName = wb.SheetNames.includes(opts.sheet) ? opts.sheet : wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const csv = XLSX.utils.sheet_to_csv(ws)
        if (opts.out) {
          writeFileSync(opts.out, csv, 'utf-8')
          printSuccess(`已导出 ${sheetName} 到 ${opts.out}`)
        } else {
          console.log(csv.split('\n').slice(0, 20).join('\n'))
          printInfo('（只显示前20行，用 --out 输出完整文件）')
        }
      } catch(e) { printError(e.message) }
    })

  // 文本清洗
  data
    .command('text <file>')
    .description('文本文件清洗处理')
    .option('--trim', '去除每行首尾空白')
    .option('--dedup', '去重（删除重复行）')
    .option('--empty', '删除空行')
    .option('--lower', '转小写')
    .option('--upper', '转大写')
    .option('--replace <from>', '替换字符串（配合 --with）')
    .option('--with <to>', '替换目标', '')
    .option('--head <n>', '只保留前N行')
    .option('--tail <n>', '只保留后N行')
    .option('--encoding <enc>', '文件编码', 'utf-8')
    .option('-o, --out <file>', '输出文件')
    .action((file, opts) => {
      if (!existsSync(file)) return printError(`文件不存在: ${file}`)
      let lines = readFileSync(file, opts.encoding).split('\n')
      if (opts.trim) lines = lines.map(l => l.trim())
      if (opts.empty) lines = lines.filter(l => l.trim() !== '')
      if (opts.dedup) lines = [...new Set(lines)]
      if (opts.lower) lines = lines.map(l => l.toLowerCase())
      if (opts.upper) lines = lines.map(l => l.toUpperCase())
      if (opts.replace) lines = lines.map(l => l.split(opts.replace).join(opts.with || ''))
      if (opts.head) lines = lines.slice(0, parseInt(opts.head))
      if (opts.tail) lines = lines.slice(-parseInt(opts.tail))
      const output = lines.join('\n')
      if (opts.out) {
        writeFileSync(opts.out, output, 'utf-8')
        printSuccess(`已输出到 ${opts.out}（${lines.length} 行）`)
      } else {
        console.log(output)
      }
    })

  // JSON处理
  data
    .command('json <file>')
    .description('JSON文件处理')
    .option('--pretty', '格式化输出')
    .option('--query <path>', '查询路径（如 data[0].name）')
    .option('--keys', '列出所有顶层键')
    .option('-o, --out <file>', '输出文件')
    .action((file, opts) => {
      if (!existsSync(file)) return printError(`文件不存在: ${file}`)
      try {
        const raw = JSON.parse(readFileSync(file, 'utf-8'))
        let result = raw
        if (opts.query) {
          try {
            result = Function(`return (data) => data.${opts.query}`)()(raw)
          } catch(e) { return printError(`查询路径错误: ${e.message}`) }
        }
        if (opts.keys) {
          const keys = typeof result === 'object' ? Object.keys(result) : '非对象类型'
          console.log(Array.isArray(keys) ? keys.join('\n') : keys)
          return
        }
        const output = opts.pretty ? JSON.stringify(result, null, 2) : JSON.stringify(result)
        if (opts.out) {
          writeFileSync(opts.out, output, 'utf-8')
          printSuccess(`已输出到 ${opts.out}`)
        } else {
          console.log(output)
        }
      } catch(e) { printError(`JSON解析失败: ${e.message}`) }
    })
}
