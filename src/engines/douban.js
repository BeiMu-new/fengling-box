import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'douban',
  description: '豆瓣搜索（电影/书/音乐）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const type = options.type || 'movie' // movie / book / music
    const url = `https://www.douban.com/j/subject_suggest?q=${encodeURIComponent(query)}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://www.douban.com'
      },
      timeout: 10000
    })
    const items = res.data || []
    return items.slice(0, limit).map(item => ({
      title: item.title,
      url: item.url,
      snippet: item.sub_title || item.episode || '',
      type: item.type,
      img: item.img,
    }))
  }
})
