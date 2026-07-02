import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'cls',
  description: '财联社搜索（财经资讯）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.cls.cn/v1/search?keyword=${encodeURIComponent(query)}&type=article&rn=${limit}&pn=1&_=${Date.now()}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.cls.cn' },
      timeout: 10000
    })
    const items = res.data?.data?.result || res.data?.data || []
    return items.slice(0, limit).map(item => ({
      title: item.title || '',
      url: item.shareurl || `https://www.cls.cn/detail/${item.id}`,
      snippet: item.brief || item.content_text?.substring(0, 200) || '',
      pubtime: item.ctime ? new Date(item.ctime * 1000).toLocaleString() : '',
      source: '财联社',
    }))
  }
})
