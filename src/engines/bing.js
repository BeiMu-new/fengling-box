import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'bing',
  description: 'Bing搜索（免费，无需Key）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      timeout: 10000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('li.b_algo').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('h2 a').text().trim()
      const url = $(el).find('h2 a').attr('href')
      const snippet = $(el).find('.b_caption p').text().trim()
      if (title && url) results.push({ title, url, snippet })
    })
    return results
  }
})
