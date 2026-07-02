import { defineEngine } from './_base.js'

export default defineEngine({
  name: 'douyin',
  description: '抖音搜索（风控极强，仅返回搜索链接）',
  stability: 'experimental',
  async search(query, options = {}) {
    return [{
      title: `[抖音] 搜索: ${query}`,
      url: `https://www.douyin.com/search/${encodeURIComponent(query)}`,
      snippet: '抖音风控极强，请直接访问链接在浏览器中查看',
      source: '抖音',
    }]
  }
})
