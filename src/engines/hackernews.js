import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'hackernews',
  description: 'Hacker News科技新闻搜索（免费Algolia API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=${limit}`
    const res = await axios.get(url, { timeout: 10000 })
    return (res.data?.hits || []).map(h => ({
      title: h.title || h.story_title || '',
      url: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
      snippet: (h.story_text || h.comment_text || '').replace(/<[^>]+>/g, '').substring(0, 300),
      author: h.author,
      points: h.points,
      comments: h.num_comments,
      created: h.created_at,
    }))
  }
})
