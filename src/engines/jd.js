import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'jd',
  description: '京东商品搜索（爬虫，可能需要登录）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://search.jd.com/Search?keyword=${encodeURIComponent(query)}&enc=utf-8`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.jd.com'
      },
      timeout: 10000
    })
    const matches = [...res.data.matchAll(/class="p-name"[^>]*>[\s\S]*?<a[^>]*href="(.*?)"[^>]*>[\s\S]*?<em>(.*?)<\/em>/g)]
    return matches.slice(0, limit).map(m => ({
      title: m[2]?.replace(/<[^>]+>/g, '').trim() || '',
      url: m[1]?.startsWith('//') ? `https:${m[1]}` : m[1] || '',
      snippet: '',
      source: '京东',
    }))
  }
})
