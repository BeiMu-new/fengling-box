// 搜索引擎基类模板
export function defineEngine(config) {
  return {
    name: config.name,
    description: config.description,
    requiresKey: config.requiresKey || false,
    requiresCookie: config.requiresCookie || false,
    stability: config.stability || 'stable', // stable / unstable / experimental
    keyConfig: config.keyConfig || null,
    async search(query, options = {}) {
      return config.search(query, options)
    }
  }
}
