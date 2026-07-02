import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'cctv',
  description: '央视网搜索',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://search.cctv.com/search.php?qtext=${encodeURIComponent(query)}&type=video&sort=dat&num=${limit}&page=1`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.cctv.com' },
      timeout: 10000
    })
    const matches = res.data.match(/"title":"(.*?)","url":"(.*?)","summary":"(.*?)"/g) || []
    return matches.slice(0, limit).map(m => {
      const parts = m.match(/"title":"(.*?)","url":"(.*?)","summary":"(.*?)"/)
      return {
        title: parts?.[1] || '',
        url: parts?.[2]?.replace(/\\/g, '') || '',
        snippet: parts?.[3] || '',
        source: '央视网',
      }
    })
  }
})
