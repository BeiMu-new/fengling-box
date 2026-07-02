import { defineEngine } from './_base.js'
import axios from 'axios'
import { getConfig } from '../utils/config.js'

export default defineEngine({
  name: 'exa',
  description: 'Exa语义搜索（需要API Key）',
  requiresKey: true,
  keyConfig: 'exa.key',
  stability: 'stable',
  async search(query, options = {}) {
    const cfg = getConfig()
    const apiKey = cfg.get('exa.key')
    if (!apiKey) throw new Error('Exa需要API Key，请运行: flb config set exa.key <your-key>')
    const limit = options.limit || 10
    const res = await axios.post('https://api.exa.ai/search', {
      query,
      numResults: limit,
      useAutoprompt: true,
    }, {
      headers: { 'x-api-key': apiKey },
      timeout: 15000
    })
    return res.data.results.map(item => ({
      title: item.title,
      url: item.url,
      snippet: item.text?.substring(0, 300) || '',
      score: item.score,
    }))
  }
})
