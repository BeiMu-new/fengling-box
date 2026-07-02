import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'github',
  description: 'GitHub代码/仓库搜索（可选Token提升限额）',
  requiresKey: false,
  keyConfig: 'github.token',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const type = options.type || 'repositories' // repositories / code / issues / users
    const cfg = getConfig()
    const token = cfg.get('github.token')
    const headers = {
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    }
    if (token) headers['Authorization'] = `Bearer ${token}`

    const url = `https://api.github.com/search/${type}?q=${encodeURIComponent(query)}&per_page=${limit}`
    const res = await axios.get(url, { headers, timeout: 10000 })
    return res.data.items.map(item => ({
      title: item.full_name || item.title || item.name,
      url: item.html_url,
      snippet: item.description || item.body?.substring(0, 200) || '',
      stars: item.stargazers_count,
      language: item.language,
    }))
  }
})
