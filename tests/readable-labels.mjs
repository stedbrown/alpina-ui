/** Run in the browser. Inspect arbitrary consumer markup as well as library elements. */
export function readableLabelIssues(root = document.body) {
  const issues = new Set()
  const canvas = document.createElement('canvas').getContext('2d')
  const range = document.createRange()
  const text = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  const hidden = new WeakMap()
  function clipped(el) {
    if (!el) return false
    if (!hidden.has(el)) {
      const style = getComputedStyle(el)
      hidden.set(el, style.clipPath === 'inset(50%)' || style.clip !== 'auto' || clipped(el.parentElement))
    }
    return hidden.get(el)
  }
  for (let node; (node = text.nextNode());) {
    const parent = node.parentElement
    if (!node.data.trim() || !parent || parent.closest('script,style,template,option,textarea')) continue
    let box = parent
    while (box && getComputedStyle(box).display === 'contents') box = box.parentElement
    if (!box || !box.checkVisibility({ visibilityProperty: true, opacityProperty: true }) || clipped(box)) continue
    range.selectNodeContents(node)
    if (!range.getClientRects().length) continue
    const style = getComputedStyle(parent)
    canvas.font = style.fontWeight + ' ' + style.fontSize + ' ' + style.fontFamily
    const fourCh = 4 * canvas.measureText('0').width
    // Layout pixels keep the text and its box in the same coordinate system,
    // including inside scaled, millimetre-accurate document previews.
    if (canvas.measureText(node.data.trim()).width >= fourCh) {
      for (let owner = box; owner; owner = owner.parentElement) {
        const display = getComputedStyle(owner).display
        const width = owner instanceof HTMLElement ? owner.offsetWidth : owner.getBBox?.().width
        if (display !== 'contents' && width + 1 < fourCh)
          issues.add('Text column narrower than 4ch: ' + node.data.trim().slice(0, 48))
        if (display !== 'inline' && display !== 'contents') break
      }
    }
    const control = parent.closest('th,button,[role="button"],.al-button,.al-badge')
    if (!control) continue
    for (const word of node.data.matchAll(/[\p{L}\p{N}]+(?:[‑-][\p{L}\p{N}]+)*/gu)) {
      range.setStart(node, word.index)
      range.setEnd(node, word.index + word[0].length)
      const lines = [...range.getClientRects()].filter(rect => rect.width && rect.height)
      if (lines.some(rect => Math.abs(rect.top - lines[0].top) > 1))
        issues.add('Split word in ' + control.tagName.toLowerCase() + ': ' + word[0])
    }
  }
  return [...issues]
}
