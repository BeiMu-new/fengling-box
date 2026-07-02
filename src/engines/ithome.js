import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'ithome',
  description: 'IT之家搜索（科技资讯）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.ithome.com/search/?type=&keyword=${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.ithome.com' },
      timeout: 10000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('li.article').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('h2 a').text().trim()
      const href = $(el).find('h2 a').attr('href')
      const snippet = $(el).find('p.summary').text().trim()
      const time = $(el).find('em.o time').text().trim()
      if (title) results.push({ title, url: href || '', snippet, pubtime: time, source: 'IT之家' })
    })
    return results
  }
})
