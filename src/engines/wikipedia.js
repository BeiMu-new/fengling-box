import { defineEngine } from './_base.js'
import axios from 'axios'

// Wikimedia 自 2026 起对「无 User-Agent」的请求直接返回 403，并附言：
//   "Please set a user-agent and respect our robot policy"
// 因此这里必须显式声明 UA（官方要求标识用途与联系方式）。
const UA = 'fengling-box/1.1.0 (https://github.com/BeiMu-new/fengling-box)'

export default defineEngine({
  name: 'wikipedia',
  description: '维基百科搜索（免费，官方API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const lang = options.lang || 'zh'
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&utf8=1`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': UA,
        'Accept': 'application/json',
      },
      timeout: 10000,
    })
    const hits = res.data?.query?.search || []
    return hits.map(item => ({
      title: item.title,
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
      snippet: (item.snippet || '').replace(/<[^>]+>/g, ''),
    }))
  }
})
