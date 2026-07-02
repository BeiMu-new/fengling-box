import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'gopkg',
  description: 'pkg.go.dev Go包搜索（免费）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://pkg.go.dev/search?q=${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      timeout: 10000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('div.SearchSnippet').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).find('h2 a').text().trim()
      const href = $(el).find('h2 a').attr('href')
      const snippet = $(el).find('.SearchSnippet-synopsis').text().trim()
      const importPath = $(el).find('.SearchSnippet-headerPath').text().trim()
      if (title) results.push({
        title,
        url: href ? `https://pkg.go.dev${href}` : '',
        snippet: snippet.substring(0, 300),
        importPath,
      })
    })
    return results
  }
})
