import chalk from 'chalk'
import { execSync } from 'child_process'

export function registerCommit(program) {
  program
    .command('commit')
    .description('AI 生成 Git commit message')
    .option('-m, --model <model>', '使用的模型', 'deepseek-chat')
    .option('-p, --provider <provider>', 'API 提供商', 'deepseek')
    .action(async (opts) => {
      try {
        // 检查是否为 git 仓库
        execSync('git rev-parse --git-dir', { stdio: 'ignore' })
      } catch {
        console.log(chalk.red('\n❌ 当前目录不是 Git 仓库'))
        console.log()
        return
      }
      // 获取 git diff
      let diff
      try {
        diff = execSync('git diff --cached --stat', { encoding: 'utf-8', maxBuffer: 1024 * 1024 })
        if (!diff.trim()) {
          diff = execSync('git diff --stat', { encoding: 'utf-8', maxBuffer: 1024 * 1024 })
        }
        if (!diff.trim()) {
          console.log(chalk.yellow('\n⚠️  没有检测到变更文件'))
          console.log(chalk.gray('  先 git add 后再试，或者有未暂存的变更'))
          console.log()
          return
        }
      } catch {
        console.log(chalk.red('\n❌ 无法获取 git diff'))
        return
      }
      console.log(chalk.bold('\n📝 检测到变更:'))
      console.log(chalk.gray(diff.slice(0, 500)))
      console.log(chalk.cyan('\n🤖 生成 commit message 需要 API 调用'))
      console.log(chalk.yellow('  当前尚未集成 AI 调用，建议手动编写:'))
      console.log(chalk.gray(`\n  git commit -m "feat: 本次变更摘要"`))
      console.log()
    })
}
