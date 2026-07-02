import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'reddit',
  description: 'Reddit论坛搜索（免费官方JSON接口）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const sort = options.sort || 'relevance'
    // 用old.reddit.com的JSON接口，反爬较宽松
    const url = `https://old.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=${limit}&sort=${sort}`
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
        },
        timeout: 15000,
        maxRedirects: 5
      })
      const posts = res.data?.data?.children || []
      return posts.slice(0, limit).map(p => {
        const d = p.data
        return {
          title: d.title,
          url: `https://www.reddit.com${d.permalink}`,
          snippet: (d.selftext || '').substring(0, 300),
          subreddit: `r/${d.subreddit}`,
          author: `u/${d.author}`,
          score: d.score,
          comments: d.num_comments,
        }
      })
    } catch (e) {
      // 降级：返回搜索链接
      return [{
        title: `[Reddit] 搜索: ${query}`,
        url: `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`,
        snippet: `Reddit反爬较严，请点击链接在浏览器中查看（错误: ${e.response?.status || e.message}）`,
      }]
    }
  }
})
