import { defineEngine } from './_base.js'
import * as cheerio from 'cheerio'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

/**
 * 解析 Bing 的跳转链接。
 * Bing 搜索结果 href 形如 https://www.bing.com/ck/a?...&u=a1<base64url>
 * 其中 `u` 参数去掉前缀 `a1` 后即为真实 URL 的 base64url 编码。
 */
function decodeBingUrl(href) {
  const value = String(href || '')
  const m = value.match(/[?&]u=a1([^&]+)/)
  if (m) {
    try {
      const b64 = m[1].replace(/-/g, '+').replace(/_/g, '/')
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
      const decoded = Buffer.from(padded, 'base64').toString('utf8')
      if (/^https?:\/\//i.test(decoded)) return decoded
    } catch { /* fallthrough */ }
  }
  return value
}

export default defineEngine({
  name: 'bing',
  description: 'Bing搜索（免费，无需Key）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 修正：旧实现实际请求的是 html.duckduckgo.com（名实不符），且该后端已被反爬。
    // 现改为请求真正的 Bing（www.bing.com/search），服务端渲染可直接静态解析。
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query)}&count=${Math.min(limit, 20)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`Bing 请求失败: HTTP ${res.status}`)
    const html = await res.text()

    // 触发验证码/异常流量时直接报错，由调用方降级
    if (/captcha|unusual traffic|验证码|安全验证|异常流量/i.test(html.slice(0, 4000))) {
      throw new Error('Bing 触发了验证码/异常流量检测')
    }

    const $ = cheerio.load(html)
    const results = []
    const seen = new Set()
    $('li.b_algo').each((i, el) => {
      if (results.length >= limit) return false
      const $a = $(el).find('h2 a').first()
      const rawHref = ($a.attr('href') || '').trim()
      const title = $a.text().trim()
      if (!title || !rawHref) return
      const href = decodeBingUrl(rawHref)
      if (!/^https?:\/\//i.test(href) || seen.has(href)) return
      seen.add(href)
      const snippet = $(el).find('.b_caption p, .b_lineclamp2, .b_algoSlug').first().text().trim()
      results.push({ title, url: href, snippet })
    })
    return results
  }
})
