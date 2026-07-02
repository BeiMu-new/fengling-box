import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'baidubaike',
  description: '百度百科搜索（免费）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://baike.baidu.com/search/word?word=${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: 10000,
      maxRedirects: 5
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('dd').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('.search-word').text().trim() || $(el).find('a').first().text().trim()
      const href = $(el).find('a').first().attr('href')
      const snippet = $(el).find('.abstract').text().trim()
      if (title && href) {
        const fullUrl = href.startsWith('http') ? href : `https://baike.baidu.com${href}`
        results.push({ title, url: fullUrl, snippet })
      }
    })
    if (results.length === 0) {
      const title = $('h1.lemmaTitle').text().trim() || $('title').text().replace(' - 百度百科', '')
      const snippet = $('div.lemma-summary').text().trim().substring(0, 300)
      if (title) results.push({ title, url: url, snippet })
    }
    return results
  }
})
