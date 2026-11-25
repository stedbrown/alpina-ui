import { names, topics } from './component-vocabulary.mjs'

function words(text) {
  return text.replace(/([a-z])([A-Z])/g, '$1 $2').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().replaceAll('ß', 'ss').replaceAll('œ', 'oe').match(/[a-z0-9]+/g) ?? []
}

const phrase = text => words(text).join(' ')
const aliases = new Map()
function index(text, ids) {
  const key = phrase(text)
  const targets = aliases.get(key) ?? new Map()
  ids.forEach((id, rank) => targets.set(id, Math.min(rank, targets.get(id) ?? Infinity)))
  aliases.set(key, targets)
}
for (const [id, translations] of Object.entries(names))
  for (const text of [id, ...translations]) index(text, [id])
for (const { items, aliases: translations } of topics)
  for (const phrases of translations) for (const text of phrases.split('|')) index(text, items)

// Optimal string alignment distance includes a swap of adjacent letters (e.g. dropdwon).
// Only close lengths can match. Longer queries still use exact, prefix and keyword matches.
function edits(a, b, limit) {
  if (Math.abs(a.length - b.length) > limit) return limit + 1
  let prior = [], previous = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const current = [i]
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + Number(a[i - 1] !== b[j - 1]))
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1])
        current[j] = Math.min(current[j], prior[j - 2] + 1)
    }
    prior = previous
    previous = current
  }
  return previous[b.length]
}

function aliasScore(query, alias) {
  if (alias === query) return 500
  if (query.length >= 3 && alias.startsWith(query)) return 300
  if (query.length < 4 || query.length > 80) return 0
  const limit = query.length >= 7 ? 2 : 1
  const distance = edits(query, alias, limit)
  return distance <= limit ? 160 - 20 * distance : 0
}

export function searchComponents(items, query = '') {
  const terms = words(query)
  if (!terms.length) return [...items].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  const normalized = terms.join(' ')
  const matches = new Map()
  for (const [alias, targets] of aliases) {
    const value = aliasScore(normalized, alias)
    if (value) for (const [id, rank] of targets) matches.set(id, Math.max(matches.get(id) ?? 0, value - rank))
  }

  function score(item) {
    const name = words(item.name)
    if (item.name === terms.join('-')) return 600
    const keyword = [...name, item.group, ...words(item.summary)]
    const byWord = terms.every(term => name.some(word => word.startsWith(term))) ? 250
      : terms.every(term => keyword.some(word => word.startsWith(term))) ? 50 : 0
    return Math.max(byWord, matches.get(item.name) ?? 0)
  }
  return items.map(item => ({ item, score: score(item) })).filter(hit => hit.score)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'en')).map(hit => hit.item)
}
