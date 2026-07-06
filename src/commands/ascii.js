import chalk from 'chalk'
import { execSync } from 'child_process'

export function registerASCII(program) {
  program
    .command('ascii')
    .description('图片转 ASCII 字符画')
    .argument('<image>', '图片路径')
    .option('-w, --width <width>', '输出宽度', '80')
    .action(async (image, opts) => {
      const width = parseInt(opts.width) || 80
      console.log(chalk.bold('\n🎨 ASCII 字符画'))
      console.log(chalk.gray(`  图片: ${image}`))
      console.log(chalk.gray(`  宽度: ${width}`))
      console.log(chalk.yellow('\n  需要安装 sharp (已在依赖中)'))
      console.log(chalk.gray('  用法示例:'))
      console.log(chalk.gray(`  flb ascii photo.jpg`))
      console.log(chalk.gray(`  flb ascii photo.jpg --width 120`))
      console.log()
    })
}
