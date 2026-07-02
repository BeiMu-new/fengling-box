import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'google',
  description: 'Google自定义搜索（需要API Key + CX，免费100次/天）',
  requiresKey: true,
  keyConfig: 'google.key',
  stability: 'stable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const apiKey = cfg.get('google.key')
    const cx = cfg.get('google.cx')
    if (!apiKey || !cx) throw new Error('Google搜索需要API Key和CX，请运行:\nflb config set google.key <your-key>\nflb config set google.cx <your-cx>\n申请地址: https://developers.google.com/custom-search/v1/overview')
    const limit = Math.min(options.limit || 10, 10)
    const res = await axios.get('https://www.googleapis.com/customsearch/v1', {
      params: { key: apiKey, cx, q: query, num: limit, lr: 'lang_zh-CN' },
      timeout: 10000
    })
    return (res.data.items || []).map(item => ({
      title: item.title,
      url: item.link,
      snippet: item.snippet || '',
    }))
  }
})
