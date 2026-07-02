import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'bilibili',
  description: 'B站视频/UP主搜索（免费）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const type = options.type || 'video' // video / upuser / article
    // B站搜索API需要wbi签名，改用搜索页链接+备选
    const searchUrl = `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}&search_source=5`
    // 尝试非签名API（旧版）
    try {
      const url = `https://api.bilibili.com/x/web-interface/search/all/v2?keyword=${encodeURIComponent(query)}&page=1`
      const res = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://www.bilibili.com',
          'Cookie': ''
        },
        timeout: 10000
      })
      const data = res.data
      if (data.code === 0) {
        const result = data.data?.result || []
        const videos = result.find(r => r.result_type === 'video')?.data || []
        return videos.slice(0, limit).map(item => ({
          title: (item.title || '').replace(/<[^>]+>/g, ''),
          url: item.arcurl || `https://www.bilibili.com/video/${item.bvid}`,
          snippet: (item.description || '').substring(0, 200),
          author: item.author,
          play: item.play,
          pubdate: item.pubdate ? new Date(item.pubdate * 1000).toLocaleDateString() : '',
        }))
      }
    } catch(e) { /* 降级 */ }
    // 降级：返回搜索链接
    return [{
      title: `[B站] 搜索: ${query}`,
      url: searchUrl,
      snippet: 'B站搜索API需要wbi签名，请点击链接在浏览器中查看',
      source: 'bilibili',
    }]
  }
})
