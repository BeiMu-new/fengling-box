import { readdirSync, renameSync, statSync, existsSync, mkdirSync, copyFileSync } from 'fs'
import { join, extname, basename, dirname } from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { printSuccess, printError, printInfo } from '../utils/output.js'

export function registerFile(program) {
  const file = program
    .command('file')
    .description('文件批量处理工具')
    .addHelpText('after', `
示例:
  flb file rename ./photos --prefix "holiday_" --start 1
  flb file rename ./docs --pattern "{name}_{date}"
  flb file rename ./images --ext jpg --upper
  flb file list ./folder --ext jpg,png
  flb file copy ./src ./dst --ext pdf
`)

  // 批量重命名
  file
    .command('rename <dir>')
    .description('批量重命名文件')
    .option('--prefix <prefix>', '添加前缀')
    .option('--suffix <suffix>', '添加后缀（在扩展名前）')
    .option('--start <n>', '序号起始值', '1')
    .option('--pad <n>', '序号补零位数', '3')
    .option('--ext <ext>', '只处理指定扩展名（如jpg,png）')
    .option('--upper', '文件名转大写')
    .option('--lower', '文件名转小写')
    .option('--replace <from>', '替换文件名中的字符串，配合 --with 使用')
    .option('--with <to>', '替换为的字符串')
    .option('--dry-run', '预览模式，不实际重命名')
    .action((dir, opts) => {
      if (!existsSync(dir)) return printError(`目录不存在: ${dir}`)
      const exts = opts.ext ? opts.ext.split(',').map(e => '.' + e.replace(/^\./, '')) : null
      let files = readdirSync(dir)
        .filter(f => statSync(join(dir, f)).isFile())
        .filter(f => !exts || exts.includes(extname(f).toLowerCase()))
        .sort()

      if (files.length === 0) return printInfo('没有找到符合条件的文件')

      let counter = parseInt(opts.start) || 1
      const pad = parseInt(opts.pad) || 3

      files.forEach(oldName => {
        const ext = extname(oldName)
        let stem = basename(oldName, ext)

        if (opts.upper) stem = stem.toUpperCase()
        if (opts.lower) stem = stem.toLowerCase()
        if (opts.replace && opts.with !== undefined) stem = stem.split(opts.replace).join(opts.with)
        if (opts.prefix) stem = opts.prefix + stem
        if (opts.suffix) stem = stem + opts.suffix

        const num = String(counter).padStart(pad, '0')
        const newName = `${stem}_${num}${ext}`
        counter++

        if (opts.dryRun) {
          console.log(chalk.gray(`[预览] ${oldName}`) + chalk.green(` → ${newName}`))
        } else {
          renameSync(join(dir, oldName), join(dir, newName))
          console.log(chalk.gray(oldName) + chalk.green(` → ${newName}`))
        }
      })
      if (!opts.dryRun) printSuccess(`已重命名 ${files.length} 个文件`)
      else printInfo(`预览完成，共 ${files.length} 个文件（未实际重命名，去掉 --dry-run 执行）`)
    })

  // 列出文件
  file
    .command('list <dir>')
    .description('列出目录中的文件')
    .option('--ext <ext>', '只显示指定扩展名')
    .option('--size', '显示文件大小')
    .action((dir, opts) => {
      if (!existsSync(dir)) return printError(`目录不存在: ${dir}`)
      const exts = opts.ext ? opts.ext.split(',').map(e => '.' + e.replace(/^\./, '')) : null
      const files = readdirSync(dir)
        .filter(f => statSync(join(dir, f)).isFile())
        .filter(f => !exts || exts.includes(extname(f).toLowerCase()))
        .sort()
      files.forEach(f => {
        if (opts.size) {
          const size = statSync(join(dir, f)).size
          const kb = (size / 1024).toFixed(1)
          console.log(`${f} ${chalk.gray(kb + 'KB')}`)
        } else {
          console.log(f)
        }
      })
      printInfo(`共 ${files.length} 个文件`)
    })

  // 批量复制
  file
    .command('copy <src> <dst>')
    .description('批量复制文件')
    .option('--ext <ext>', '只复制指定扩展名')
    .action((src, dst, opts) => {
      if (!existsSync(src)) return printError(`源目录不存在: ${src}`)
      if (!existsSync(dst)) mkdirSync(dst, { recursive: true })
      const exts = opts.ext ? opts.ext.split(',').map(e => '.' + e.replace(/^\./, '')) : null
      const files = readdirSync(src)
        .filter(f => statSync(join(src, f)).isFile())
        .filter(f => !exts || exts.includes(extname(f).toLowerCase()))
      files.forEach(f => {
        copyFileSync(join(src, f), join(dst, f))
        console.log(chalk.gray(`✓ ${f}`))
      })
      printSuccess(`已复制 ${files.length} 个文件到 ${dst}`)
    })
}
