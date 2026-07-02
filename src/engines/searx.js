import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'searx',
  description: 'Searx/SearXNG开源元搜索（默认公共实例，可自定义实例）',
  stability: 'unstable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const instance = cfg.get('searx.url') || 'https://searx.tiekoetter.com'
    const limit = options.limit || 10
    const url = `${instance.replace(/\/$/, '')}/search`
    const res = await axios.get(url, {
      params: {
        q: query,
        format: 'json',
        language: 'zh-CN',
        safesearch: 0,
      },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    })
    const results = res.data?.results || []
    return results.slice(0, limit).map(item => ({
      title: item.title,
      url: item.url,
      snippet: item.content || '',
      engine: item.engine,
    }))
  }
})
