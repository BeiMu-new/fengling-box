import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'npm',
  description: 'npm包搜索（免费，官方API）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const url = `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=${limit}`
    const res = await axios.get(url, { timeout: 10000 })
    return res.data.objects.map(obj => ({
      title: obj.package.name,
      url: `https://www.npmjs.com/package/${obj.package.name}`,
      snippet: obj.package.description || '',
      version: obj.package.version,
      author: obj.package.publisher?.username,
    }))
  }
})
