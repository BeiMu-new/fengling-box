import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'huxiu',
  description: '虎嗅网搜索（科技/商业资讯）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.huxiu.com/search/?query=${encodeURIComponent(query)}&article_type=0`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.huxiu.com' },
      timeout: 10000
    })
    const matches = [...res.data.matchAll(/"article_id":(\d+),"title":"(.*?)","summary":"(.*?)"/g)]
    return matches.slice(0, limit).map(m => ({
      title: m[2] || '',
      url: `https://www.huxiu.com/article/${m[1]}.html`,
      snippet: m[3] || '',
      source: '虎嗅',
    }))
  }
})
