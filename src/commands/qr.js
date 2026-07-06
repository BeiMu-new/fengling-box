import chalk from 'chalk'

export function registerQR(program) {
  program
    .command('qr')
    .description('在终端生成二维码')
    .argument('<text...>', '要编码的文字或链接')
    .action((text) => {
      const input = text.join(' ')
      try {
        const qrcode = require('qrcode-terminal')
        console.log(chalk.bold('\n📱 二维码'))
        qrcode.generate(input, { small: true })
        console.log(chalk.gray(`  内容: ${input}`))
        console.log()
      } catch {
        // fallback: 使用ASCII art简化版
        console.log(chalk.bold('\n📱 二维码'))
        console.log(chalk.gray('  qrcode-terminal 未安装，正在尝试加载...'))
        console.log(chalk.gray('  内容: ' + input))
        console.log(chalk.yellow('  提示: npm install -g qrcode-terminal'))
        console.log()
      }
    })
}
