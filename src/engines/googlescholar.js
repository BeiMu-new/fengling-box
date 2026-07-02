import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'googlescholar',
  description: 'Google Scholar学术搜索（爬虫，可能不稳定）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}&hl=zh-CN&num=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9'
      },
      timeout: 15000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('.gs_r.gs_or.gs_scl').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('.gs_rt a').text().trim()
      const href = $(el).find('.gs_rt a').attr('href')
      const snippet = $(el).find('.gs_rs').text().trim()
      const meta = $(el).find('.gs_a').text().trim()
      const cited = $(el).find('.gs_fl a').first().text()
      if (title) results.push({ title, url: href || '', snippet: snippet.substring(0, 300), meta, cited })
    })
    return results
  }
})
