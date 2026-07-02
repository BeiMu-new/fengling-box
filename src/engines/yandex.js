import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'yandex',
  description: 'Yandex搜索（俄罗斯搜索引擎，爬虫）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://yandex.com/search/?text=${encodeURIComponent(query)}&lang=zh`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
      },
      timeout: 15000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('li.serp-item').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('h2 a').text().trim()
      const href = $(el).find('h2 a').attr('href')
      const snippet = $(el).find('.text-container').text().trim()
      if (title && href) results.push({ title, url: href, snippet: snippet.substring(0, 200) })
    })
    return results
  }
})
