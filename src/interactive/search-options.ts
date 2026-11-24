export interface SearchOption {
  value: string
  label: string
  keywords?: readonly string[]
  detail?: string
  disabled?: boolean
}
export function foldText(text: string) {
  return text.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/ß/g, 'ss').trim()
}
export function filterOptions<T extends SearchOption>(
  items: readonly T[],
  query: string,
): readonly T[] {
  const terms = foldText(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return items
  return items.filter((item) => {
    const text = foldText([item.label, item.value, item.detail, ...(item.keywords ?? [])].join(' '))
    return terms.every((term) => text.includes(term))
  })
}
