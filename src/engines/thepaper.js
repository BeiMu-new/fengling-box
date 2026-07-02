import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'thepaper',
  description: '澎湃新闻搜索',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.thepaper.cn/api/search/query?q=${encodeURIComponent(query)}&type=news&from=0&size=${limit}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.thepaper.cn' },
      timeout: 10000
    })
    const items = res.data?.data?.hits?.hits || []
    return items.map(item => {
      const src = item._source || {}
      return {
        title: src.name || src.title || '',
        url: `https://www.thepaper.cn/newsDetail_forward_${item._id}`,
        snippet: src.summary || src.content?.substring(0, 200) || '',
        pubtime: src.pubtime || '',
        source: '澎湃新闻',
      }
    })
  }
})
