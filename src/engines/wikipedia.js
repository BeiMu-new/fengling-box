import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'wikipedia',
  description: '维基百科搜索（免费，官方API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const lang = options.lang || 'zh'
    const url = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=${limit}&format=json&utf8=1`
    const res = await axios.get(url, { timeout: 10000 })
    return res.data.query.search.map(item => ({
      title: item.title,
      url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(item.title)}`,
      snippet: item.snippet.replace(/<[^>]+>/g, ''),
    }))
  }
})
