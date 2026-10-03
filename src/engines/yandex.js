import { defineEngine } from './_base.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

export default defineEngine({
  name: 'yandex',
  description: 'Yandex搜索（免费；Yandex 对机房/异常出口 IP 会弹人机验证，住宅网络下正常）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 修正：旧实现把请求偷偷转发给了 html.duckduckgo.com（与引擎名不符），
    // 现改为真正请求 Yandex 本站。Yandex 的搜索结果页是服务端渲染的，可静态解析。
    const url = `https://yandex.com/search/?text=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ru;q=0.7',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    if (!res.ok) throw new Error(`Yandex 请求失败: HTTP ${res.status}`)
    const html = await res.text()

    if (/Are you not a robot|SmartCaptcha|captcha|Подтвердите/i.test(html.slice(0, 4000))) {
      throw new Error('Yandex 触发了人机验证（机房/异常出口 IP 会被拦，住宅网络下通常可用）')
    }

    const { load } = await import('cheerio')
    const $ = load(html)
    const results = []
    const seen = new Set()
    $('li.serp-item, .serp-item').each((i, el) => {
      if (results.length >= limit) return false
      const $el = $(el)
      const $a = $el.find('a.OrganicTitle-Link, a.Link_theme_normal, h2 a').first()
      const href = ($a.attr('href') || '').trim()
      const title = ($a.text() || $el.find('.OrganicTitle-LinkText').text() || '').trim()
      if (!title || !href) return
      const full = href.startsWith('http') ? href : 'https://yandex.com' + href
      if (seen.has(full)) return
      seen.add(full)
      const snippet = $el.find('.OrganicTextContentSpan, .OrganicText').first().text().trim()
      results.push({ title, url: full, snippet })
    })
    return results
  }
})
