import axios from 'axios'
import chalk from 'chalk'
import ora from 'ora'
import { printError, printInfo } from '../utils/output.js'

// 可信来源白名单
const TRUSTED = [
  'xinhuanet.com', 'news.cn', 'people.com.cn', 'cctv.com', 'mod.gov.cn',
  'mfa.gov.cn', 'gov.cn', 'chinanews.com.cn', 'thepaper.cn', 'bjnews.com.cn',
  'reuters.com', 'ap.org', 'bbc.com', 'nytimes.com', 'wsj.com',
  'ft.com', 'economist.com', 'nature.com', 'science.org',
  'zaobao.com.sg', 'cna.com.tw',
]

const UNRELIABLE = [
  'epochtimes.com', 'ntdtv.com', 'rfa.org',
  'secretchina.com', 'minghui.org',
]

const DISPUTED = [
  'voachinese.com', 'rfi.fr', 'dw.com',
]

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch { return url }
}

function checkReputation(domain) {
  if (TRUSTED.some(d => domain.endsWith(d))) return { level: 'trusted', label: '可信', color: 'green' }
  if (UNRELIABLE.some(d => domain.endsWith(d))) return { level: 'unreliable', label: '不可信', color: 'red' }
  if (DISPUTED.some(d => domain.endsWith(d))) return { level: 'disputed', label: '争议', color: 'yellow' }
  return { level: 'unknown', label: '未知', color: 'gray' }
}

function getSourceType(domain) {
  const official = ['gov.cn', 'mod.gov.cn', 'mfa.gov.cn', 'xinhuanet.com', 'news.cn', 'cctv.com', 'people.com.cn']
  const news = ['chinanews.com.cn', 'thepaper.cn', 'bjnews.com.cn', 'reuters.com', 'ap.org', 'bbc.com', 'nytimes.com', 'zaobao.com.sg', 'cna.com.tw']
  const selfMedia = ['toutiao.com', 'weixin.qq.com', 'zhihu.com', 'jianshu.com', 'csdn.net']
  if (official.some(d => domain.endsWith(d))) return '官方媒体'
  if (news.some(d => domain.endsWith(d))) return '新闻媒体'
  if (selfMedia.some(d => domain.endsWith(d))) return '自媒体'
  return '未知类型'
}

export function registerVerify(program) {
  program
    .command('verify <urls...>')
    .description('信源可信度核实')
    .option('--detail', '显示详细分析')
    .addHelpText('after', `
示例:
  flb verify https://www.xinhuanet.com/xxx
  flb verify https://example1.com https://example2.com
  flb verify https://toutiao.com/xxx --detail
`)
    .action(async (urls, opts) => {
      console.log(chalk.bold('\n🔍 信源核实结果\n'))
      for (const url of urls) {
        const domain = getDomain(url)
        const rep = checkReputation(domain)
        const type = getSourceType(domain)
        const color = rep.color

        console.log(chalk.bold(`URL: ${url}`))
        console.log(`  域名: ${chalk.cyan(domain)}`)
        console.log(`  类型: ${chalk.cyan(type)}`)
        console.log(`  可信度: ${chalk[color](rep.label)}`)

        if (rep.level === 'unreliable') {
          console.log(chalk.red('  ⚠ 警告: 该来源在不可信名单中，内容请勿采信'))
        } else if (rep.level === 'disputed') {
          console.log(chalk.yellow('  ⚠ 注意: 该来源存在争议，需交叉验证'))
        } else if (rep.level === 'unknown') {
          console.log(chalk.gray('  ℹ 该来源不在已知名单中，请自行判断'))
        } else {
          console.log(chalk.green('  ✓ 该来源在可信名单中'))
        }

        if (opts.detail) {
          const spinner = ora('  正在检查URL可达性...').start()
          try {
            const r = await axios.head(url, { timeout: 5000 })
            spinner.stop()
            console.log(`  HTTP状态: ${chalk.green(r.status)}`)
          } catch(e) {
            spinner.stop()
            console.log(`  HTTP状态: ${chalk.red('不可达或超时')}`)
          }
        }
        console.log()
      }
      console.log(chalk.gray('注：信源核实仅作参考，最终需人工判断内容真实性'))
    })

  // 快捷命令
  program
    .command('v <urls...>', { hidden: true })
    .description('verify的快捷命令')
    .action(async (urls) => {
      for (const url of urls) {
        const domain = getDomain(url)
        const rep = checkReputation(domain)
        const color = rep.color
        console.log(`${chalk[color]('[' + rep.label + ']')} ${domain} — ${url}`)
      }
    })
}
