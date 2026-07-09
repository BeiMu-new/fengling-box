import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'cctv',
  description: '央视网搜索（搜索结果由JS动态加载，可能无结果）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 央视搜索结果通过JS/AJAX加载，直接请求HTML无法获取结果
    // 改用移动版搜索接口
    const url = `https://search.cctv.com/m/search.php?qtext=${encodeURIComponent(query)}&type=video&sort=dat&num=${limit}&page=1`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Referer': 'https://search.cctv.com/',
      },
      timeout: 15000
    })
    const $ = cheerio.load(res.data)
    const results = []
    // Parse mobile search results
    $('a').each((i, el) => {
      if (results.length >= limit) return false
      const title = $(el).text().trim()
      const href = $(el).attr('href') || ''
      if (title.length > 5 && href && (href.includes('cctv.com') || href.includes('tv.cctv'))) {
        // Deduplicate
        if (!results.some(r => r.url === href)) {
          const snippet = $(el).parent().find('p, span, .desc, .time').text().trim().substring(0, 200)
          results.push({ title, url: href, snippet: snippet || '', source: '央视网' })
        }
      }
    })
    // Fallback: try desktop version
    if (results.length === 0) {
      const url2 = `https://search.cctv.com/search.php?qtext=${encodeURIComponent(query)}&type=video&sort=dat&num=${limit}&page=1`
      const res2 = await axios.get(url2, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Referer': 'https://www.cctv.com',
        },
        timeout: 15000
      })
      const $2 = cheerio.load(res2.data)
      $2('a').each((i, el) => {
        if (results.length >= limit) return false
        const title = $2(el).text().trim()
        const href = $2(el).attr('href') || ''
        if (title.length > 5 && href && (href.includes('cctv.com') || href.includes('tv.cctv'))) {
          if (!results.some(r => r.url === href)) {
            results.push({ title, url: href, snippet: '', source: '央视网' })
          }
        }
      })
    }
    return results
  }
})