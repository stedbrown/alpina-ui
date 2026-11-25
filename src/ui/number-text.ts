// Format text for display only. Identifiers, ISO dates, input values and SVG geometry keep their syntax.
export function numberText(value: string | number | bigint) {
  return String(value).replace(/(^|[\s(]|\bCHF|\d[eE])-(?=\d)/gu, '$1−')
}
