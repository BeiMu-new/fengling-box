import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'pdd',
  description: '拼多多商品搜索（爬虫，风控强）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(query)}`
    return [{
      title: `[拼多多] 搜索: ${query}`,
      url: `https://mobile.yangkeduo.com/search_result.html?search_key=${encodeURIComponent(query)}`,
      snippet: '拼多多反爬虫较强，请直接访问链接查看结果',
      source: '拼多多',
    }]
  }
})
