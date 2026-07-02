import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'zhihu',
  description: '知乎搜索（爬虫，可能需要Cookie）',
  requiresCookie: true,
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const cfg_type = options.type || 'content' // content / question / article / user
    const url = `https://www.zhihu.com/api/v4/search_v3?t=${cfg_type}&q=${encodeURIComponent(query)}&limit=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'x-requested-with': 'fetch',
        'Referer': 'https://www.zhihu.com',
      },
      timeout: 10000
    })
    const items = res.data?.data || []
    return items.map(item => {
      const obj = item.object || {}
      return {
        title: obj.title || obj.question?.title || '',
        url: obj.url || '',
        snippet: (obj.excerpt || obj.content || '').substring(0, 200),
        author: obj.author?.name || '',
        voteup: obj.voteup_count,
      }
    })
  }
})
