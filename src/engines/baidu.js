import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'baidu',
  description: '百度搜索（免费，无需Key）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      timeout: 10000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('div.result').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('h3 a').text().trim()
      const href = $(el).find('h3 a').attr('href')
      const snippet = $(el).find('.c-abstract').text().trim() ||
                      $(el).find('.content-right_8Zs40').text().trim()
      if (title && href) results.push({ title, url: href, snippet })
    })
    return results
  }
})
