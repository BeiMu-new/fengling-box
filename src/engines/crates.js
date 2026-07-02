import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'crates',
  description: 'crates.io Rust包搜索（免费官方API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://crates.io/api/v1/crates?q=${encodeURIComponent(query)}&per_page=${limit}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'fengling-box/1.0 (npm package)' },
      timeout: 10000
    })
    return (res.data?.crates || []).map(c => ({
      title: c.name,
      url: `https://crates.io/crates/${c.name}`,
      snippet: c.description || '',
      version: c.newest_version,
      downloads: c.downloads,
    }))
  }
})
