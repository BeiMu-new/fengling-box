import { defineEngine } from './_base.js'
import axios from 'axios'

export default defineEngine({
  name: 'anysearch',
  description: 'AnySearch AI聚合搜索（内置，无需额外安装）',
  stability: 'stable',
  async search(query, options = {}) {
    const limit = options.limit || 10
    const apiUrl = process.env.ANYSEARCH_API_URL || 'https://api.anysearch.com/mcp'
    const apiKey = process.env.ANYSEARCH_API_KEY || ''
    const timeout = parseInt(process.env.ANYSEARCH_TIMEOUT || '30')

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/event-stream',
      }
      if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

      const payload = {
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: {
          name: 'search',
          arguments: { query, max_results: Math.min(limit, 5) },
        },
      }

      const res = await axios.post(apiUrl, payload, {
        headers,
        timeout: timeout * 1000,
      })

      const data = res.data
      if (data.error) {
        throw new Error(data.error.message || 'AnySearch JSON-RPC error')
      }
      const result = data.result || {}
      const text = extractText(result)
      const parsed = parseMarkdownResults(text)
      return (parsed.length > 0 ? parsed : extractUrls(text)).slice(0, limit).map(item => ({
        title: item.title || item.url || '',
        url: item.url || '',
        snippet: item.description || '',
      }))
    } catch (e) {
      if (e.response?.status === 401 || e.response?.status === 403) {
        throw new Error('AnySearch 认证失败，请检查 ANYSEARCH_API_KEY')
      }
      if (e.code === 'ECONNABORTED') {
        throw new Error(`AnySearch 请求超时 (${timeout}s)`)
      }
      throw new Error(`AnySearch 搜索失败: ${e.message}`)
    }
  },
})

function extractText(result) {
  const content = result.content || []
  if (Array.isArray(content)) {
    return content.map(item => (typeof item.text === 'string' ? item.text : '')).join('\n').trim()
  }
  if (typeof content === 'string') return content.trim()
  return ''
}

function parseMarkdownResults(text) {
  const results = []
  let current = null
  for (const line of text.split('\n')) {
    const heading = line.match(/^###\s+\d+\.\s+(.+?)\s*$/)
    if (heading) {
      if (current) results.push(current)
      current = { title: heading[1].trim(), url: '', description: '' }
      continue
    }
    if (!current) continue
    const urlMatch = line.match(/^-\s+\*\*URL\*\*:\s+(\S+)/)
    if (urlMatch) {
      current.url = urlMatch[1].trim()
      continue
    }
    if (line.trim() && !line.startsWith('#') && !line.startsWith('- **URL**')) {
      current.description = (current.description + ' ' + line.trim()).trim()
    }
  }
  if (current) results.push(current)
  if (results.length > 0) return results
  // fallback: extract URLs
  return []
}

function extractUrls(text) {
  const urls = [...text.matchAll(/https?:\/\/[^\s)>\]]+/g)]
  return [...new Map(urls.map(u => [u[0], { title: u[0], url: u[0], description: '' }])).values()]
}
