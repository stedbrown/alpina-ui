// The order within each task lists the primary component before supporting components.
const tasks = [
  [['date', 'datum', 'data'], ['date-picker', 'calendar', 'swiss-date']],
  [['invoice', 'fattura', 'rechnung', 'facture'], ['invoice-document', 'swiss-qr-bill', 'letter', 'qr-bill-scanner']],
  [['address', 'indirizzo', 'adresse'], ['swiss-address-form', 'swiss-postal-code-input', 'canton-select', 'canton-combobox']],
  [['holiday', 'holidays', 'festivi', 'feiertage', 'jours feries'], ['calendar', 'date-picker']],
]

function words(text) {
  return text.replace(/([a-z])([A-Z])/g, '$1 $2').normalize('NFKD').replace(/\p{M}/gu, '')
    .toLowerCase().match(/[a-z0-9]+/g) ?? []
}

export function searchComponents(items, query = '') {
  const terms = words(query)
  if (!terms.length) return [...items].sort((a, b) => a.name.localeCompare(b.name, 'en'))
  const phrase = terms.join(' ')
  const byTask = new Map()
  for (const [aliases, identifiers] of tasks) {
    if (!aliases.some(alias => alias === phrase || (phrase.length >= 3 && alias.startsWith(phrase)))) continue
    identifiers.forEach((id, index) => byTask.set(id, Math.max(byTask.get(id) ?? 0, 180 - index)))
  }
  function score(item) {
    const name = words(item.name), summary = words(item.summary)
    if (item.name === terms.join('-')) return 200
    if (byTask.has(item.name)) return byTask.get(item.name)
    if (terms.every(term => name.some(word => word.startsWith(term)))) return 120
    if (terms.every(term => [...name, item.group].some(word => word.startsWith(term)))) return 90
    if (terms.every(term => [...name, ...summary].some(word => word.startsWith(term)))) return 40
    return 0
  }
  return items.map(item => ({ item, score: score(item) })).filter(hit => hit.score)
    .sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name, 'en')).map(hit => hit.item)
}
