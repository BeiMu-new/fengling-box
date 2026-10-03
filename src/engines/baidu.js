import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'baidu',
  description: '百度搜索（免费，无需Key）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://www.baidu.com/s?wd=${encodeURIComponent(query)}&rn=${limit}`
    const res = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-CN,zh;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
      timeout: 10000,
    })
    const $ = cheerio.load(res.data)
    const results = []
    const seen = new Set()

    // 百度改版后结构多变：
    //   老版：div.result > h3.t a
    //   新版：div.c-container（含 c-title / cosc-title-a）
    // 用多选择器兜底，并按「是否走 baidu.php 跳转」剔除广告位。
    $('div.result, div.c-container').each((i, el) => {
      if (results.length >= limit) return false
      const $el = $(el)
      const $a = $el.find('h3 a, a.cosc-title-a, h3.t a').first()
      let href = ($a.attr('href') || '').trim()
      if (!href) return
      // 广告/推广位经 baidu.php 中转，直接跳过
      if (/baidu\.com\/baidu\.php/i.test(href)) return
      if (href.startsWith('/')) href = 'https://www.baidu.com' + href
      if (!/^https?:\/\//i.test(href)) return
      const title = $a.text().trim() || $el.find('h3').first().text().trim()
      if (!title || seen.has(href)) return
      seen.add(href)
      const snippet = $el.find('.c-abstract').text().trim()
        || $el.find('[class*="content-right"]').text().trim()
        || $el.find('.c-span-last').text().trim()
      results.push({ title, url: href, snippet })
    })
    return results
  }
})
