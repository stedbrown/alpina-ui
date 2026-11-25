import { formatCHF } from 'alpina-ui/swiss/format-chf'
import { posterEstimate } from './poster-estimate.js'
import { enhanceSpecimen } from './type-specimen-controls.js'

function enhanceEstimate(card) {
  const total = card.querySelector('[data-estimate-total]')
  const copies = card.querySelector('#poster-copies')
  const ink = card.querySelector('#poster-second-ink')
  const count = card.querySelector('[data-copy-count]')

  function update() {
    const label = copies.value + ' copies'
    count.textContent = label
    copies.setAttribute('aria-valuetext', label)
    total.textContent = formatCHF(posterEstimate(copies.valueAsNumber, ink.checked), 'de-CH')
  }

  copies.addEventListener('input', update)
  ink.addEventListener('change', update)
  if (copies.value !== copies.defaultValue || ink.checked !== ink.defaultChecked) update()
}

function enhancePressLog(card) {
  const select = card.querySelector('#press-week')
  const charts = card.querySelectorAll('[data-print-weeks] > figure')
  function update() {
    charts.forEach((chart, index) => { chart.hidden = index !== select.selectedIndex })
  }
  select.addEventListener('change', update)
  if (select.selectedIndex !== 0) update()
}

const estimate = document.getElementById('poster-estimate')
if (estimate) enhanceEstimate(estimate)
const log = document.getElementById('press-log')
if (log) enhancePressLog(log)
const specimen = document.getElementById('type-specimen')
if (specimen) enhanceSpecimen(specimen)
