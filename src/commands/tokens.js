import chalk from 'chalk'
import { table } from 'table'

export function registerTokens(program) {
  const tokens = program
    .command('tokens')
    .description('统计文本的 token 数（支持中文+英文）')
    .argument('<text...>', '要统计的文本')
    .option('-m, --model <model>', '模型类型 (deepseek/llama/claude) 用于估计', 'deepseek')
    .action((text, opts) => {
      const input = text.join(' ')
      const count = estimateTokens(input)
      console.log(chalk.bold('\n📊 Token 统计'))
      console.log(`  字符数: ${input.length}`)
      console.log(`  预估 Token: ${chalk.cyan.bold(count)}`)
      if (input.length > 0) {
        console.log(`  约合: ${(count / 1000).toFixed(1)}K tokens`)
      }
      console.log()
    })

  const cost = program
    .command('cost')
    .description('预估 Token 消耗（不计价，仅展示用量分布）')
    .argument('<tokens>', '总 token 数或输入文本')
    .option('--cache-hit <ratio>', '缓存命中率 0-1', '0')
    .option('--output-ratio <ratio>', '输出 token 占比 0-1', '0.3')
    .action((input, opts) => {
      const total = parseInt(input) || estimateTokens(input)
      const cacheRatio = parseFloat(opts.cacheHit)
      const outputRatio = parseFloat(opts.outputRatio)
      const cacheHit = Math.round(total * cacheRatio * (1 - outputRatio))
      const cacheMiss = Math.round(total * (1 - cacheRatio) * (1 - outputRatio))
      const output = Math.round(total * outputRatio)

      const data = [
        ['类型', 'Token 数', '占比'],
        ['输入（缓存命中）', String(cacheHit), `${(cacheRatio * 100).toFixed(0)}%`],
        ['输入（缓存未命中）', String(cacheMiss), `${((1 - cacheRatio) * 100).toFixed(0)}%`],
        ['输出', String(output), `${(outputRatio * 100).toFixed(0)}%`],
      ]
      console.log(chalk.bold('\n📊 Token 用量分布'))
      console.log(table(data))
      console.log(chalk.gray(`总 Token: ${total.toLocaleString()}（${(total / 1e6).toFixed(2)}M）`))
      console.log(chalk.gray(`缓存命中率: ${(cacheRatio * 100).toFixed(0)}% | 输出占比: ${(outputRatio * 100).toFixed(0)}%`))
      console.log(chalk.gray('提示: 实际价格取决于模型定价和缓存命中率，本工具仅展示用量分布'))
      console.log()
    })
}

function estimateTokens(text) {
  // 粗略估计：中文约1.5字/token，英文约3.5字符/token
  let chineseChars = 0
  let englishChars = 0
  for (const ch of text) {
    if (/[\u4e00-\u9fff\u3400-\u4dbf]/.test(ch)) chineseChars++
    else if (/\S/.test(ch)) englishChars++
  }
  return Math.ceil(chineseChars / 1.5 + englishChars / 3.5)
}
