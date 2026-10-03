import { defineEngine } from './_base.js'
import axios from 'axios'

const UA = 'fengling-box/1.1.0 (https://github.com/BeiMu-new/fengling-box)'

export default defineEngine({
  name: 'pypi',
  description: 'PyPI Python包查询（免费，官方JSON API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const q = String(query || '').trim()
    if (!q) return []

    // 说明：pypi.org/search 已是纯前端渲染（服务端只回 JS 空壳），HTML 解析不再可行。
    // 改用官方 JSON API 做「精确包名」查询：https://pypi.org/pypi/<name>/json
    // 传空格分隔的多个包名时，逐个查询并合并。
    const names = q.split(/[\s,]+/).map(s => s.trim()).filter(Boolean).slice(0, limit)
    const results = []
    for (const name of names) {
      if (results.length >= limit) break
      try {
        const res = await axios.get(`https://pypi.org/pypi/${encodeURIComponent(name)}/json`, {
          headers: { 'User-Agent': UA, 'Accept': 'application/json' },
          timeout: 10000,
          validateStatus: (s) => s < 500,
        })
        if (res.status !== 200 || !res.data?.info) continue
        const info = res.data.info
        results.push({
          title: info.name,
          url: info.package_url || `https://pypi.org/project/${info.name}/`,
          snippet: info.summary || '',
          version: info.version,
        })
      } catch {
        // 单个包查询失败不影响其它包
      }
    }
    return results
  }
})
