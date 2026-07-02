import { defineEngine } from './_base.js'
import { execSync } from 'child_process'
import chalk from 'chalk'

export default defineEngine({
  name: 'anysearch',
  description: 'AnySearch AI聚合搜索（需要安装 smart-search）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 检查 smart-search 是否可用
    let cmd
    try {
      // Windows下需要用cmd /c
      const isWin = process.platform === 'win32'
      const command = isWin
        ? `smart-search anysearch-search "${query.replace(/"/g, '\\"')}"`
        : `smart-search anysearch-search "${query.replace(/"/g, '\\"')}"`
      const output = execSync(command, {
        encoding: 'utf-8',
        timeout: 30000,
        shell: true,
        stdio: ['ignore', 'pipe', 'pipe']
      })
      // 解析 smart-search 返回的 JSON
      const parsed = JSON.parse(output)
      if (!parsed.ok) throw new Error(parsed.error || 'anysearch 返回错误')
      // smart-search 的结果格式化在 content 或 results 里
      const results = parsed.results || []
      if (results.length > 0) {
        return results.slice(0, limit).map(item => ({
          title: item.title || item.name || '',
          url: item.url || '',
          snippet: item.description || item.content || item.snippet || '',
        }))
      }
      // 从 content 里解析（回退）
      const content = parsed.content || ''
      const matches = [...content.matchAll(/### \d+\.\s(.+?)\n- \*\*URL\*\*:\s(.+?)\n-\s(.+?)(?=\n###|\n---|\n$|$)/gs)]
      return matches.slice(0, limit).map(m => ({
        title: m[1].trim(),
        url: m[2].trim(),
        snippet: m[3].trim().replace(/\n/g, ' ').substring(0, 300),
      }))
    } catch (e) {
      if (e.message.includes('ENOENT') || e.message.includes('not recognized') || e.message.includes('command not found')) {
        throw new Error('未找到 smart-search 命令，请先安装：npm install -g @konbakuyomu/smart-search')
      }
      throw e
    }
  }
})
