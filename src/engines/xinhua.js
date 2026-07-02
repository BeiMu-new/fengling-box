import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'xinhua',
  description: '新华网搜索',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://so.news.cn/#search?keyword=${encodeURIComponent(query)}&curPage=1&sortField=0&searchFields=1&lang=cn`
    const apiUrl = `https://search.news.cn/getNews?keyword=${encodeURIComponent(query)}&curPage=1&sortField=0&searchFields=1&lang=cn&pcn=&cnt=&sinceDate=&untilDate=&minLen=&maxLen=&ss=&fmt=&ct=`
    const res = await axios.get(apiUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://so.news.cn/' },
      timeout: 10000
    })
    const items = res.data?.content?.results || []
    return items.slice(0, limit).map(item => ({
      title: item.title || '',
      url: item.url || '',
      snippet: item.summary || '',
      pubtime: item.pubtime || '',
      source: item.siteName || '新华网',
    }))
  }
})
