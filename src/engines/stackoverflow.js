import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'stackoverflow',
  description: 'Stack Overflow问答搜索（官方API，免费）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://api.stackexchange.com/2.3/search/advanced?q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=${limit}&order=desc&sort=relevance&filter=default`
    const res = await axios.get(url, { timeout: 10000 })
    return res.data.items.map(item => ({
      title: item.title,
      url: item.link,
      snippet: `回答数: ${item.answer_count} | 浏览: ${item.view_count} | 票数: ${item.score}`,
      answered: item.is_answered,
      tags: item.tags?.join(', '),
    }))
  }
})
