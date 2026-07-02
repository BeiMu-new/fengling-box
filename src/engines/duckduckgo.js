import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'duckduckgo',
  description: 'DuckDuckGo搜索（免费，隐私友好）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    // DuckDuckGo Instant Answer API
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`
    const res = await axios.get(url, { timeout: 10000 })
    const data = res.data
    const results = []
    if (data.AbstractText) {
      results.push({ title: data.Heading, url: data.AbstractURL, snippet: data.AbstractText })
    }
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics) {
        if (results.length >= limit) break
        if (topic.Text && topic.FirstURL) {
          results.push({ title: topic.Text.split(' - ')[0], url: topic.FirstURL, snippet: topic.Text })
        }
      }
    }
    return results
  }
})
