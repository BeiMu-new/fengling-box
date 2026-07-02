import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'brave',
  description: 'Brave Search（需要API Key，免费2000次/月）',
  requiresKey: true,
  keyConfig: 'brave.key',
  stability: 'stable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const apiKey = cfg.get('brave.key')
    if (!apiKey) throw new Error('Brave Search需要API Key，请运行: flb config set brave.key <your-key>\n申请地址: https://api.search.brave.com/')
    const limit = options.limit || 10
    const res = await axios.get('https://api.search.brave.com/res/v1/web/search', {
      params: { q: query, count: limit, search_lang: 'zh' },
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey
      },
      timeout: 10000
    })
    return (res.data.web?.results || []).map(item => ({
      title: item.title,
      url: item.url,
      snippet: item.description || '',
    }))
  }
})
