import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'tavily',
  description: 'Tavily AI搜索（需要API Key，免费额度1000次/月）',
  requiresKey: true,
  keyConfig: 'tavily.key',
  stability: 'stable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const apiKey = cfg.get('tavily.key')
    if (!apiKey) throw new Error('Tavily需要API Key，请运行: flb config set tavily.key <your-key>')
    const limit = options.limit || 10
    const res = await axios.post('https://api.tavily.com/search', {
      api_key: apiKey,
      query,
      max_results: limit,
      include_answer: true,
    }, { timeout: 15000 })
    const results = res.data.results.map(item => ({
      title: item.title,
      url: item.url,
      snippet: item.content,
      score: item.score,
    }))
    if (res.data.answer) {
      results.unshift({ title: '[AI摘要]', url: '', snippet: res.data.answer })
    }
    return results
  }
})
