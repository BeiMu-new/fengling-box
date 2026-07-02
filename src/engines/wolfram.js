import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'wolfram',
  description: 'Wolfram Alpha计算型搜索（需要AppID，免费2000次/月）',
  requiresKey: true,
  keyConfig: 'wolfram.appid',
  stability: 'stable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const appid = cfg.get('wolfram.appid')
    if (!appid) throw new Error('Wolfram Alpha需要AppID，请运行: flb config set wolfram.appid <your-appid>\n申请地址: https://developer.wolframalpha.com/')
    const limit = options.limit || 10
    const res = await axios.get('https://api.wolframalpha.com/v2/query', {
      params: {
        input: query,
        appid,
        output: 'json',
        format: 'plaintext',
      },
      timeout: 20000
    })
    const pods = res.data?.queryresult?.pods || []
    return pods.slice(0, limit).map(pod => ({
      title: pod.title,
      url: `https://www.wolframalpha.com/input?i=${encodeURIComponent(query)}`,
      snippet: (pod.subpods || []).map(s => s.plaintext).filter(Boolean).join('\n'),
      scanner: pod.scanner,
    }))
  }
})
