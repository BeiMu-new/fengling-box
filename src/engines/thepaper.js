import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'thepaper',
  description: '澎湃新闻搜索',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://api.thepaper.cn/search/web/news?keyword=${encodeURIComponent(query)}&pageNum=1&pageSize=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Referer': 'https://www.thepaper.cn/',
        'Origin': 'https://www.thepaper.cn',
        'Accept': 'application/json, text/plain, */*',
      },
      timeout: 15000,
      validateStatus: () => true,
    })
    // 澎湃接口在风控/限流（含机房 IP）时统一返回 code 99998「系统繁忙」，
    // 这里显式抛错，避免上层静默当成「没有结果」。
    const code = res.data?.code
    if (code === 99998) {
      throw new Error('澎湃接口返回 99998（系统繁忙）——该接口对机房/高频 IP 有风控，住宅网络下通常可用')
    }
    if (code !== 0 || !res.data?.data) {
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
