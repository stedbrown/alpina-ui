/** Three full-size tick labels remain legible in a narrow plot. */
export function CategoryAxis({ labels }: { labels: readonly string[] }) {
  const last = labels.length - 1
  const middle = Math.floor(last / 2)
  return <div className="al-series-range">
    <span>{labels[0]}</span>
    {middle > 0 && <span className="al-series-middle" style={{ insetInlineStart: (100 * middle / last) + '%' }}>{labels[middle]}</span>}
    {last > 0 && <span>{labels[last]}</span>}
  </div>
}

export function LineGuides({ top, bottom }: { top: number; bottom: number }) {
  return <g className="al-series-guides" aria-hidden="true">
    <line x1="0" x2="100%" y1={top} y2={top} />
    {bottom !== top && <>
      <line x1="0" x2="100%" y1={(top + bottom) / 2} y2={(top + bottom) / 2} strokeDasharray="2 4" />
      <line x1="0" x2="100%" y1={bottom} y2={bottom} />
    </>}
  </g>
}
