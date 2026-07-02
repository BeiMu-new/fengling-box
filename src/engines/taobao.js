import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'taobao',
  description: '淘宝商品搜索（爬虫，风控强，不稳定）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://suggest.taobao.com/sug?code=utf-8&q=${encodeURIComponent(query)}&callback=cb`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.taobao.com' },
      timeout: 10000
    })
    const match = res.data.match(/\((.*)\)/)
    if (!match) return []
    const data = JSON.parse(match[1])
    return (data.result || []).slice(0, limit).map(item => ({
      title: item[0],
      url: `https://s.taobao.com/search?q=${encodeURIComponent(item[0])}`,
      snippet: `搜索建议: ${item[0]}`,
    }))
  }
})
