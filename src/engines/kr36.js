import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'kr36',
  description: '36氪搜索（科技/创业资讯）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.36kr.com/api/search/articles?q=${encodeURIComponent(query)}&per_page=${limit}&page=1`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.36kr.com' },
      timeout: 10000
    })
    const items = res.data?.data?.items || []
    return items.slice(0, limit).map(item => ({
      title: item.title || '',
      url: `https://www.36kr.com/p/${item.id}`,
      snippet: item.summary || item.abstract || '',
      pubtime: item.published_at || '',
      source: '36氪',
    }))
  }
})
