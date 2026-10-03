import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

// 秘塔 AI 搜索（官方 API）
// 端点：POST https://metaso.cn/api/v1/search
// 鉴权：Authorization: Bearer <mk-...>
// 计费：约 ¥0.03/次（响应 credits 字段，实测每次 3）
export default defineEngine({
  name: 'metaso',
  description: '秘塔AI搜索（官方API，需Key；¥0.03/次，注册送5000点+每日刷新）',
  requiresKey: true,
  keyConfig: 'metaso.key',
  stability: 'stable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const apiKey = cfg.get('metaso.key')
    if (!apiKey) throw new Error('秘塔需要API Key，请运行: flb config set metaso.key <your-key>')
    const limit = options.limit || 10
    const scope = options.scope || 'webpage' // webpage / document / scholar / ...
    const res = await axios.post('https://metaso.cn/api/v1/search', {
      q: query,
      scope,
      includeSummary: false,
      conciseSnippet: false,
    }, {
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    })
    const items = res.data?.webpages || res.data?.items || []
    return items.slice(0, limit).map(item => ({
      title: item.title || '',
      url: item.link || item.url || '',
      snippet: item.snippet || '',
      score: item.score,
      date: item.date,
    }))
  }
})
