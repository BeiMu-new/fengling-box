import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'ithome',
  description: 'IT之家搜索（基于RSS+关键词过滤）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // IT之家搜索页面已下线，改用RSS获取最新文章+关键词过滤
    const url = 'https://www.ithome.com/rss/'
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.ithome.com' },
      timeout: 10000
    })
    const $ = cheerio.load(res.data, { xmlMode: true })
    const results = []
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0)
    $('item').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('title').text().trim()
      const link = $(el).find('link').text().trim()
      const desc = $(el).find('description').text().trim()
      const pubDate = $(el).find('pubDate').text().trim()
      // Match if any keyword appears in title or description
      const text = (title + ' ' + desc).toLowerCase()
      const matched = keywords.some(k => text.includes(k))
      if (matched && title) {
        results.push({
          title,
          url: link,
          snippet: desc.substring(0, 200) || '',
          pubtime: pubDate || '',
          source: 'IT之家',
        })
      }
    })
    return results
  }
})