import { defineEngine } from './_base.js'
import axios from 'axios'
import * as cheerio from 'cheerio'

export default defineEngine({
  name: 'moegirl',
  description: '萌娘百科搜索（直链跳转方式）',
  stability: 'unstable',
  async search(query, options = {}) {
    const limit = options.limit || 5
    // 构造直接词条URL（萌娘百科支持直接访问词条）
    const directUrl = `https://zh.moegirl.org.cn/${encodeURIComponent(query)}`
    // 用百度搜索萌娘百科
    const baiduUrl = `https://www.baidu.com/s?wd=site:zh.moegirl.org.cn ${encodeURIComponent(query)}`
    const results = []
    // 主链接
    results.push({
      title: `[萌娘百科] ${query}`,
      url: directUrl,
      snippet: `点击链接访问萌娘百科词条：${query}（萌娘百科防爬，直接点链接访问）`
    })
    // 搜索其他相关词条：用维基百科API格式访问萌娘
    try {
      const res = await axios.get(`https://zh.moegirl.org.cn/api.php`, {
        params: {
          action: 'opensearch',
          search: query,
          limit: limit,
          namespace: 0,
          format: 'json'
        },
        headers: {
          'User-Agent': 'fengling-box (+https://www.npmjs.com/package/fengling-box)',
          'Origin': 'https://zh.moegirl.org.cn'
        },
        timeout: 10000
      })
      const [term, titles, descs, urls] = res.data
      titles.forEach((title, i) => {
        results.push({
          title,
          url: urls[i],
          snippet: descs[i] || ''
        })
      })
    } catch (e) {
      // opensearch失败，只返回直链
    }
    return results.slice(0, limit)
  }
})
