import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'thepaper',
  description: '澎湃新闻搜索',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://api.thepaper.cn/search/web/news?keyword=${encodeURIComponent(query)}&pageNum=1&pageSize=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.thepaper.cn/',
        'Origin': 'https://www.thepaper.cn',
      },
      timeout: 15000
    })
    if (res.data?.code !== 0 || !res.data?.data) {
      // API might return 99998 "系统繁忙", return empty
      return []
    }
    const items = res.data?.data?.list || res.data?.data?.content?.data || []
    return items.slice(0, limit).map(item => ({
      title: item.name || item.title || '',
      url: `https://www.thepaper.cn/newsDetail_forward_${item.contId || item.id}`,
      snippet: item.summary || item.contentSmallBigPic?.substring(0, 200) || '',
      pubtime: item.pubTimeLong || item.pubTime || '',
      source: '澎湃新闻',
    }))
  }
})