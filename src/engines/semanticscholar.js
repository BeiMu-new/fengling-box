import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'semanticscholar',
  description: 'Semantic Scholar学术搜索（官方API，免费）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=title,authors,year,abstract,url,citationCount`
    const res = await axios.get(url, {
      headers: { 'User-Agent': 'fengling-box/1.0.0' },
      timeout: 15000
    })
    return res.data.data.map(paper => ({
      title: paper.title,
      url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
      snippet: paper.abstract?.substring(0, 300) || '',
      authors: paper.authors?.map(a => a.name).join(', '),
      year: paper.year,
      citations: paper.citationCount,
    }))
  }
})
