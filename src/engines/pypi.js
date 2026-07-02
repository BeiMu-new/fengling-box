import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'pypi',
  description: 'PyPI Python包搜索（免费）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://pypi.org/search/?q=${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('a.package-snippet').each((i, el) => {
      if (results.length >= limit) return false
      const name = $(el).find('.package-snippet__name').text().trim()
      const version = $(el).find('.package-snippet__version').text().trim()
      const desc = $(el).find('.package-snippet__description').text().trim()
      const href = $(el).attr('href')
      if (name) results.push({ title: name, url: `https://pypi.org${href}`, snippet: desc, version })
    })
    return results
  }
})
