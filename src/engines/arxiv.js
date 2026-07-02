import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'arxiv',
  description: 'arXiv学术论文搜索（免费，官方API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=${limit}`
    const res = await axios.get(url, { timeout: 15000 })
    const entries = res.data.match(/<entry>([\s\S]*?)<\/entry>/g) || []
    return entries.map(entry => {
      const title = entry.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.trim().replace(/\s+/g, ' ') || ''
      const summary = entry.match(/<summary>([\s\S]*?)<\/summary>/)?.[1]?.trim().replace(/\s+/g, ' ') || ''
      const id = entry.match(/<id>(.*?)<\/id>/)?.[1]?.trim() || ''
      const authors = [...entry.matchAll(/<name>(.*?)<\/name>/g)].map(m => m[1]).join(', ')
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim() || ''
      return { title, url: id, snippet: summary.substring(0, 300), authors, published }
    })
  }
})
