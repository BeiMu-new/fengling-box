import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'imdb',
  description: 'IMDb电影/电视搜索（官方API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://v3.sg.media-imdb.com/suggestion/x/${encodeURIComponent(query)}.json`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    })
    const items = res.data?.d || []
    return items.slice(0, limit).map(item => ({
      title: item.l,
      url: `https://www.imdb.com/title/${item.id}/`,
      snippet: `${item.q || ''} ${item.y || ''} | ${item.s || ''}`.trim(),
      year: item.y,
      type: item.q,
    }))
  }
})
