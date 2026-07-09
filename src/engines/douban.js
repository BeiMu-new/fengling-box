import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'douban',
  description: '豆瓣搜索（电影/书/音乐）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const type = options.type || 'movie' // movie / book
    const cat = type === 'book' ? 1001 : 1002
    const url = `https://www.douban.com/search?cat=${cat}&q=${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.douban.com',
        'Accept-Language': 'zh-CN,zh;q=0.9',
      },
      timeout: 10000
    })
    const $ = cheerio.load(res.data)
    const results = []
    $('.result').each((i, el) => {
      if (results.length >= limit) return false
      const titleEl = $(el).find('h3 a')
      const title = titleEl.text().trim()
      const href = titleEl.attr('href') || ''
      const snippet = $(el).find('.rating_pub, .subject-cast, p').text().trim().substring(0, 200)
      const rating = $(el).find('.allstar').attr('class')?.match(/allstar(\d+)/)?.[1]
      if (title) {
        results.push({
          title,
          url: href,
          snippet,
          rating: rating ? `${parseInt(rating) / 2}分` : '',
          source: '豆瓣',
        })
      }
    })
    return results
  }
})