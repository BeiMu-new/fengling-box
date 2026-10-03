import { defineEngine } from './_base.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

export default defineEngine({
  name: 'kr36',
  description: '36氪搜索（科技/创业资讯）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 修正：旧的 /api/search/articles 已被 36氪下线（返回 "PpController handler class cannot be loaded"）。
    // 现改用其前端实际调用的网关接口 /api/mis/nav/search/resultbytype，
    // 并按官方 genGatewayParams() 的规则构造参数（siteId=1 / platformId=2 + timestamp）。
    const payload = {
      partner_id: 'web',
      timestamp: Date.now(),
      param: {
        siteId: 1,
        platformId: 2,
        searchType: 'article',
        searchWord: String(query || ''),
        sort: 'date',
        pageSize: Math.min(limit, 20),
        pageEvent: 0,
        pageCallback: '',
      },
    }
    const res = await fetch('https://gateway.36kr.com/api/mis/nav/search/resultbytype', {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.36kr.com/',
        'Origin': 'https://www.36kr.com',
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`36氪请求失败: HTTP ${res.status}`)
    const json = await res.json()
    if (json.code !== 0) {
      throw new Error(`36氪接口返回异常: ${json.msg || ('code=' + json.code)}`)
    }
    const list = json.data?.itemList || []
    return list.slice(0, limit).map(item => ({
      title: item.widgetTitle || '',
      url: item.itemId ? `https://www.36kr.com/p/${item.itemId}` : '',
      snippet: item.content || '',
      pubtime: item.publishTime ? new Date(Number(item.publishTime)).toISOString() : '',
      source: '36氪',
    })).filter(r => r.title && r.url)
  }
})
