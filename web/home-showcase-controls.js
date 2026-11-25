import { formatCHF } from 'alpina-ui/swiss/format-chf'
import { posterEstimate } from './poster-estimate.js'
import { enhanceSpecimen } from './type-specimen-controls.js'

function enhanceEstimate(card) {
  const template = card.querySelector('template')
  const fallback = card.querySelector('[data-print-summary]')
  const total = card.querySelector('[data-estimate-total]')
  const copies = template.content.getElementById('poster-copies')
  const ink = template.content.getElementById('poster-second-ink')
  const count = template.content.querySelector('[data-copy-count]')

  function update() {
    const label = copies.value + ' copies'
    count.textContent = label
    copies.setAttribute('aria-valuetext', label)
    total.textContent = formatCHF(posterEstimate(copies.valueAsNumber, ink.checked), 'de-CH')
  }

  copies.addEventListener('input', update)
  ink.addEventListener('change', update)
  fallback.replaceWith(template.content)
  template.remove()
  update()
}

function enhancePressLog(card) {
  const template = card.querySelector('template')
  const select = template.content.querySelector('select')
  const fallback = card.querySelector('[data-print-weeks]')
  const weeks = Array.from(fallback.children)
  const charts = weeks.map((week) => week.querySelector('figure'))
  const initial = Math.max(0, weeks.findIndex((week) => week.open))
  const hadFocus = fallback.contains(document.activeElement)
  select.selectedIndex = initial
  fallback.replaceChildren(charts[initial])
  fallback.before(template.content)
  template.remove()
  select.addEventListener('change', () => fallback.replaceChildren(charts[select.selectedIndex]))
  if (hadFocus) select.focus()
}

const estimate = document.getElementById('poster-estimate')
if (estimate) enhanceEstimate(estimate)
const log = document.getElementById('press-log')
if (log) enhancePressLog(log)
const specimen = document.getElementById('type-specimen')
if (specimen) enhanceSpecimen(specimen)
