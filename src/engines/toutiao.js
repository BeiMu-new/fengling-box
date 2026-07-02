import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'toutiao',
  description: '今日头条搜索（爬虫，可能不稳定）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.toutiao.com/api/search/content/?keyword=${encodeURIComponent(query)}&count=${limit}&cur_tab=1`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.toutiao.com'
      },
      timeout: 10000
    })
    const items = res.data?.data || []
    return items.slice(0, limit).map(item => ({
      title: item.title || '',
      url: item.article_url || '',
      snippet: item.abstract_content || item.content || '',
      source: item.source || '',
    }))
  }
})
