import assert from 'node:assert/strict'

/** Measure the two-digit days and the edges of adjacent painted status rules. */
export async function assertCalendarSpacing(calendar, { booking = false } = {}) {
  const metrics = await calendar.evaluate(el => {
    const range = document.createRange()
    const gaps = [], marks = []
    for (const row of el.querySelectorAll('tbody tr')) {
      let previous
      for (const day of row.querySelectorAll('[data-day]')) {
        range.selectNodeContents(day)
        const glyph = range.getBoundingClientRect()
        const box = day.getBoundingClientRect()
        const rule = getComputedStyle(day, '::before')
        const style = getComputedStyle(day)
        const insetRule = rule.content !== 'none' && parseFloat(rule.borderBottomWidth) > 0
        const status = day.dataset.status
        const mark = status && {
          left: box.left + (insetRule ? parseFloat(rule.left) : 0),
          right: box.right - (insetRule ? parseFloat(rule.right) : 0),
          top: box.bottom - (insetRule ? parseFloat(rule.borderBottomWidth) : parseFloat(style.borderBottomWidth)),
          style: insetRule ? rule.borderBottomStyle : style.borderBottomStyle,
        }
        if (previous && day.textContent.length === 2 && previous.double)
          gaps.push(glyph.left - previous.glyph.right)
        if (mark && previous?.mark) marks.push({
          neighbours: mark.left - previous.mark.right,
          glyphs: Math.min(mark.left - previous.glyph.right, glyph.left - previous.mark.right),
          below: mark.top - glyph.bottom,
          status, style: mark.style,
        })
        previous = { glyph, mark, double: day.textContent.length === 2 }
      }
    }
    return { width: el.clientWidth, viewport: document.documentElement.clientWidth, gaps, marks }
  })
  assert.equal(metrics.viewport, 180)
  assert.ok(metrics.width <= 180 && metrics.gaps.length >= 10)
  assert.ok(Math.min(...metrics.gaps) >= 4, 'Two-digit dates need a 4px gutter in the ' + metrics.width + 'px month grid')
  if (booking) {
    assert.ok(metrics.marks.length >= 20)
    for (const mark of metrics.marks) {
      assert.ok(mark.neighbours >= 4 && mark.glyphs >= 2 && mark.below >= 2, 'Separate the status from adjacent marks and digits')
      assert.equal(mark.style, { closed: 'dashed', full: 'dotted', available: 'solid' }[mark.status])
    }
  }
}
