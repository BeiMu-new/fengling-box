import chalk from 'chalk'
import axios from 'axios'
import { exec } from 'child_process'
import ora from 'ora'
import { printError, printInfo, printSuccess } from '../utils/output.js'

export function registerTool(program) {
  // URL打开
  program
    .command('open <url>')
    .description('用默认浏览器打开URL')
    .action((url) => {
      const platform = process.platform
      const cmd = platform === 'win32' ? `start "" "${url}"`
                : platform === 'darwin' ? `open "${url}"`
                : `xdg-open "${url}"`
      exec(cmd, (err) => {
        if (err) printError(`打开失败: ${err.message}`)
        else printSuccess(`已在浏览器中打开: ${url}`)
      })
    })

  // 翻译
  program
    .command('translate <text...>')
    .alias('tr')
    .description('文本翻译（免费Google翻译接口）')
    .option('--to <lang>', '目标语言（zh/en/ja/ko/fr/de/es等）', 'zh')
    .option('--from <lang>', '源语言（auto自动识别）', 'auto')
    .addHelpText('after', `
示例:
  flb translate "hello world"
  flb translate "你好世界" --to en
  flb translate "こんにちは" --to zh
  flb tr "hello" --to ja
`)
    .action(async (textParts, opts) => {
      const text = textParts.join(' ')
      const spinner = ora('正在翻译...').start()
      try {
        // 用免费Google翻译（无官方文档接口，可能不稳定）
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${opts.from}&tl=${opts.to}&dt=t&q=${encodeURIComponent(text)}`
        const res = await axios.get(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 10000
        })
        spinner.stop()
        const result = res.data[0].map(item => item[0]).join('')
        const detectedLang = res.data[2]
        console.log(chalk.cyan(`\n原文 (${detectedLang}):`))
        console.log(`  ${text}`)
        console.log(chalk.cyan(`\n译文 (${opts.to}):`))
        console.log(chalk.green(`  ${result}\n`))
      } catch (err) {
        spinner.stop()
        // 降级：用MyMemory翻译API（免费额度5000次/天）
        try {
          const spinner2 = ora('切换到备用翻译服务...').start()
          const langPair = `${opts.from === 'auto' ? 'autodetect' : opts.from}|${opts.to}`
          const res = await axios.get('https://api.mymemory.translated.net/get', {
            params: { q: text, langpair: langPair },
            timeout: 10000
          })
          spinner2.stop()
          const result = res.data?.responseData?.translatedText || ''
          console.log(chalk.cyan(`\n原文:`))
          console.log(`  ${text}`)
          console.log(chalk.cyan(`\n译文 (${opts.to}):`))
          console.log(chalk.green(`  ${result}\n`))
        } catch (e2) {
          printError(`翻译失败: ${err.message}`)
        }
      }
    })
}
