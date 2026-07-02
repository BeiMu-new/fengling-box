import sharp from 'sharp'
import { readdirSync, statSync, existsSync, mkdirSync } from 'fs'
import { join, extname, basename, dirname } from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { printSuccess, printError, printInfo } from '../utils/output.js'

const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.tiff', '.avif']

function getImages(pathOrDir) {
  if (statSync(pathOrDir).isFile()) return [pathOrDir]
  return readdirSync(pathOrDir)
    .filter(f => IMG_EXTS.includes(extname(f).toLowerCase()))
    .map(f => join(pathOrDir, f))
}

export function registerImage(program) {
  const image = program
    .command('image')
    .description('图片处理工具（压缩/转格式/加水印/调整尺寸）')
    .addHelpText('after', `
示例:
  flb image compress ./photos --quality 80 --out ./compressed
  flb image convert ./image.png --to webp
  flb image convert ./photos --to jpg --out ./converted
  flb image resize ./photo.jpg --width 800
  flb image resize ./photos --width 1920 --height 1080 --fit cover
  flb image watermark ./photo.jpg --text "枫铃" --out ./wm
  flb image info ./photo.jpg
`)

  // 压缩
  image
    .command('compress <path>')
    .description('压缩图片（保持格式）')
    .option('-q, --quality <n>', '压缩质量 1-100', '80')
    .option('-o, --out <dir>', '输出目录（默认覆盖原文件）')
    .action(async (imgPath, opts) => {
      if (!existsSync(imgPath)) return printError(`路径不存在: ${imgPath}`)
      const files = getImages(imgPath)
      if (files.length === 0) return printInfo('未找到图片文件')
      const q = parseInt(opts.quality)
      const spinner = ora(`压缩 ${files.length} 张图片...`).start()
      let ok = 0
      for (const f of files) {
        const ext = extname(f).toLowerCase()
        const outPath = opts.out
          ? join(opts.out, basename(f))
          : f
        if (opts.out && !existsSync(opts.out)) mkdirSync(opts.out, { recursive: true })
        try {
          const s = sharp(f)
          if (ext === '.jpg' || ext === '.jpeg') await s.jpeg({ quality: q }).toFile(outPath + '.tmp')
          else if (ext === '.png') await s.png({ quality: q }).toFile(outPath + '.tmp')
          else if (ext === '.webp') await s.webp({ quality: q }).toFile(outPath + '.tmp')
          else { await s.toFile(outPath + '.tmp') }
          const { renameSync } = await import('fs')
          renameSync(outPath + '.tmp', outPath)
          ok++
        } catch(e) { console.error(chalk.red(`✖ ${f}: ${e.message}`)) }
      }
      spinner.stop()
      printSuccess(`已压缩 ${ok}/${files.length} 张图片`)
    })

  // 格式转换
  image
    .command('convert <path>')
    .description('转换图片格式')
    .requiredOption('-t, --to <fmt>', '目标格式: jpg/png/webp/avif/tiff')
    .option('-q, --quality <n>', '质量 1-100', '90')
    .option('-o, --out <dir>', '输出目录')
    .action(async (imgPath, opts) => {
      if (!existsSync(imgPath)) return printError(`路径不存在: ${imgPath}`)
      const files = getImages(imgPath)
      if (files.length === 0) return printInfo('未找到图片文件')
      const fmt = opts.to.toLowerCase()
      const q = parseInt(opts.quality)
      const spinner = ora(`转换 ${files.length} 张图片为 ${fmt}...`).start()
      let ok = 0
      for (const f of files) {
        const outName = basename(f, extname(f)) + '.' + fmt
        const outDir = opts.out || dirname(f)
        if (opts.out && !existsSync(opts.out)) mkdirSync(opts.out, { recursive: true })
        const outPath = join(outDir, outName)
        try {
          await sharp(f)[fmt]?.({ quality: q }).toFile(outPath)
          ?? await sharp(f).toFormat(fmt, { quality: q }).toFile(outPath)
          ok++
        } catch(e) { console.error(chalk.red(`✖ ${f}: ${e.message}`)) }
      }
      spinner.stop()
      printSuccess(`已转换 ${ok}/${files.length} 张图片`)
    })

  // 调整尺寸
  image
    .command('resize <path>')
    .description('调整图片尺寸')
    .option('-W, --width <n>', '宽度（像素）')
    .option('-H, --height <n>', '高度（像素）')
    .option('--fit <fit>', 'cover/contain/fill/inside/outside', 'inside')
    .option('-o, --out <dir>', '输出目录')
    .action(async (imgPath, opts) => {
      if (!existsSync(imgPath)) return printError(`路径不存在: ${imgPath}`)
      const files = getImages(imgPath)
      if (files.length === 0) return printInfo('未找到图片文件')
      const w = opts.width ? parseInt(opts.width) : undefined
      const h = opts.height ? parseInt(opts.height) : undefined
      if (!w && !h) return printError('至少指定 --width 或 --height')
      const spinner = ora(`调整 ${files.length} 张图片尺寸...`).start()
      let ok = 0
      for (const f of files) {
        const outDir = opts.out || dirname(f)
        if (opts.out && !existsSync(opts.out)) mkdirSync(opts.out, { recursive: true })
        const outPath = join(outDir, basename(f))
        try {
          await sharp(f).resize(w, h, { fit: opts.fit }).toFile(outPath + '.tmp')
          const { renameSync } = await import('fs')
          renameSync(outPath + '.tmp', outPath)
          ok++
        } catch(e) { console.error(chalk.red(`✖ ${f}: ${e.message}`)) }
      }
      spinner.stop()
      printSuccess(`已调整 ${ok}/${files.length} 张图片`)
    })

  // 文字水印
  image
    .command('watermark <path>')
    .description('添加文字水印')
    .requiredOption('--text <text>', '水印文字')
    .option('--size <n>', '字体大小', '36')
    .option('--color <color>', '颜色(rgba)', 'rgba(255,255,255,0.6)')
    .option('--position <pos>', '位置: bottom-right/center/bottom-left/top-right', 'bottom-right')
    .option('-o, --out <dir>', '输出目录（默认覆盖）')
    .action(async (imgPath, opts) => {
      if (!existsSync(imgPath)) return printError(`路径不存在: ${imgPath}`)
      const files = getImages(imgPath)
      if (files.length === 0) return printInfo('未找到图片文件')
      const spinner = ora(`添加水印...`).start()
      let ok = 0
      for (const f of files) {
        const outDir = opts.out || dirname(f)
        if (opts.out && !existsSync(opts.out)) mkdirSync(opts.out, { recursive: true })
        const outPath = join(outDir, basename(f))
        try {
          const img = sharp(f)
          const meta = await img.metadata()
          const fontSize = parseInt(opts.size)
          const text = opts.text
          // SVG水印
          const svg = `<svg width="${meta.width}" height="${meta.height}">
            <style>.wm { fill: ${opts.color}; font-size: ${fontSize}px; font-family: sans-serif; }</style>
            <text class="wm" x="${opts.position.includes('right') ? meta.width - 20 : 20}"
              y="${opts.position.includes('bottom') ? meta.height - 20 : 40}"
              text-anchor="${opts.position.includes('right') ? 'end' : 'start'}">${text}</text>
          </svg>`
          await img.composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).toFile(outPath)
          ok++
        } catch(e) { console.error(chalk.red(`✖ ${f}: ${e.message}`)) }
      }
      spinner.stop()
      printSuccess(`已添加水印 ${ok}/${files.length} 张图片`)
    })

  // 图片信息
  image
    .command('info <file>')
    .description('查看图片信息')
    .action(async (file, opts) => {
      if (!existsSync(file)) return printError(`文件不存在: ${file}`)
      try {
        const meta = await sharp(file).metadata()
        console.log(chalk.bold('\n图片信息:'))
        console.log(`  格式: ${chalk.cyan(meta.format)}`)
        console.log(`  尺寸: ${chalk.cyan(meta.width + ' × ' + meta.height)}`)
        console.log(`  通道: ${chalk.cyan(meta.channels)}`)
        console.log(`  色彩空间: ${chalk.cyan(meta.space)}`)
        console.log(`  DPI: ${chalk.cyan(meta.density || 'N/A')}`)
        const { statSync } = await import('fs')
        const size = statSync(file).size
        console.log(`  文件大小: ${chalk.cyan((size / 1024).toFixed(1) + ' KB')}`)
      } catch(e) { printError(e.message) }
    })
}
