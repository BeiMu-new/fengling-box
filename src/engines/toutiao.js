import { defineEngine } from './_base.js'
import * as cheerio from 'cheerio'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

/** 解析头条结果卡片上的 cr-params（HTML 实体转义过的 JSON） */
function parseCrParams(raw) {
  if (!raw) return null
  const decoded = raw
    .replace(/&quot;/g, '"')
    .replace(/&#x3D;/g, '=')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
  try { return JSON.parse(decoded) } catch { return null }
}

function stripTags(s) {
  return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

export default defineEngine({
  name: 'toutiao',
  description: '今日头条搜索（免费，无需Key）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 修正：旧的 www.toutiao.com/api/search/content/ 已不再返回结果（page_count=0）。
    // 现改为抓取服务端渲染的 so.toutiao.com 搜索页，解析结果卡片上的 cr-params 数据；
    // 卡片里的 url 字段恒为空，正文链接由 gid 还原为 /group/<gid>/。
    const url = `https://so.toutiao.com/search?keyword=${encodeURIComponent(query)}&pd=synthesis`
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`今日头条请求失败: HTTP ${res.status}`)
    const html = await res.text()
    if (/请输入验证码|安全验证|captcha/i.test(html.slice(0, 3000))) {
      throw new Error('今日头条触发了人机验证（换住宅 IP 通常可正常）')
    }

    const $ = cheerio.load(html)
    const results = []
    const seen = new Set()
    $('div.result-content').each((i, el) => {
      if (results.length >= limit) return false
      const data = parseCrParams($(el).attr('cr-params'))
      if (!data) return
      const gid = data.gid
      const title = stripTags(data.title)
      if (!gid || !title || seen.has(String(gid))) return
      seen.add(String(gid))

      // 摘要：取卡片可见文本，去掉标题前缀后截断
      let snippet = stripTags($(el).text())
      if (snippet.startsWith(title)) snippet = snippet.slice(title.length).trim()
      snippet = snippet.slice(0, 120)

      results.push({
        title,
        url: `https://www.toutiao.com/group/${gid}/`,
        snippet,
      })
    })
    return results
  }
})
