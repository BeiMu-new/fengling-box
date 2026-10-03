import { defineEngine } from './_base.js'
import * as cheerio from 'cheerio'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36'

export default defineEngine({
  name: 'duckduckgo',
  description: 'DuckDuckGo搜索（免费，隐私友好）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // 说明：html.duckduckgo.com 与 lite 端点均会按 TLS 指纹反爬 —— axios（Node TLS 栈）
    // 一律收到 202 空壳页；而 Node 原生 fetch（undici）可正常拿到服务端渲染的 lite 页面。
    // 因此本引擎改用全局 fetch（Node >=18 内置），不再走 axios。
    const url = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`
    const res = await fetch(url, {
      headers: {
        'User-Agent': UA,
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    })
    if (!res.ok && res.status !== 202) {
      throw new Error(`DuckDuckGo 请求失败: HTTP ${res.status}`)
    }
    const html = await res.text()
    const $ = cheerio.load(html)

    // lite 页结构：<a class="result-link" href="//duckduckgo.com/l/?uddg=真实URL">标题</a>
    //             紧随其后 <td class="result-snippet">摘要</td>
    const anchors = []
    $('a.result-link').each((i, el) => {
      const href = $(el).attr('href') || ''
      const title = $(el).text().trim()
      if (!title) return
      const m = href.match(/uddg=([^&]+)/)
      let finalUrl = href
      if (m) {
        try { finalUrl = decodeURIComponent(m[1]) } catch { finalUrl = href }
      } else if (href.startsWith('//')) {
        finalUrl = 'https:' + href
      }
      if (!/^https?:\/\//i.test(finalUrl)) return
      // 剔除 DDG 自家页面（广告 "more info" 等）
      if (/^https?:\/\/duckduckgo\.com\/(y\.js|duckduckgo-help-pages)/i.test(finalUrl)) return
      anchors.push({ title, url: finalUrl })
    })

    const snippets = []
    $('td.result-snippet').each((i, el) => { snippets.push($(el).text().trim()) })

    return anchors.slice(0, limit).map((a, i) => ({
      title: a.title,
      url: a.url,
      snippet: snippets[i] || '',
    }))
  }
})
