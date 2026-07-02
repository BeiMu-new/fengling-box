import { getConfig } from './config.js'

const MAX_HISTORY = 100

export function addHistory(engine, query) {
  const cfg = getConfig()
  const history = cfg.get('_history') || []
  history.unshift({
    engine,
    query,
    time: new Date().toISOString(),
  })
  if (history.length > MAX_HISTORY) history.length = MAX_HISTORY
  cfg.set('_history', history)
}

export function getHistory(limit = 20) {
  const cfg = getConfig()
  const history = cfg.get('_history') || []
  return history.slice(0, limit)
}

export function clearHistory() {
  const cfg = getConfig()
  cfg.set('_history', [])
}
