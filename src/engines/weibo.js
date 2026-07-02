import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'weibo',
  description: '微博热搜/内容搜索（爬虫，可能不稳定）',
  requiresCookie: false,
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const isHot = query === 'hot' || query === '热搜'
    if (isHot) {
      // 获取微博热搜榜
      const url = 'https://weibo.com/ajax/side/hotSearch'
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://weibo.com'
        },
        timeout: 10000
      })
      const items = res.data?.data?.realtime || []
      return items.slice(0, limit).map((item, i) => ({
        title: item.word,
        url: `https://s.weibo.com/weibo?q=%23${encodeURIComponent(item.word)}%23`,
        snippet: `热度: ${item.num || ''} | 标签: ${item.label_name || '无'}`,
        rank: i + 1,
      }))
    } else {
      const url = `https://s.weibo.com/weibo?q=${encodeURIComponent(query)}&typeall=1&suball=1`
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Referer': 'https://weibo.com'
        },
        timeout: 10000
      })
      const $ = cheerio.load(res.data)
      const results = []
      $('div.card-wrap').each((i, el) => {
        if (results.length >= limit) return false
        const text = $(el).find('p.txt').text().trim()
        const author = $(el).find('a.name').text().trim()
        const link = $(el).find('a.from').attr('href')
        if (text) results.push({ title: author, url: link ? `https:${link}` : '', snippet: text.substring(0, 200) })
      })
      return results
    }
  }
})
