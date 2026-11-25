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

const gridSwitch = document.getElementById('show-grid')
gridSwitch.addEventListener('change', () => {
  document.getElementById('programme-guides').hidden = !gridSwitch.checked
})
const typeProof = document.getElementById('type-proof')
document.getElementById('proof-scale').addEventListener('change', event => { typeProof.dataset.role = event.target.value })
document.getElementById('proof-spacing').addEventListener('change', event => { typeProof.dataset.tracking = event.target.value })
const themeSwitch = document.getElementById('proof-dark')
themeSwitch.addEventListener('change', () => {
  document.getElementById('appearance-proof').dataset.alTheme = themeSwitch.checked ? 'dark' : 'light'
})
enhanceSpecimen(document.getElementById('access-proof'))

// The rest of the page is static. Load React only when a stateful sample is approached.
const loaded = new WeakSet()
const pending = new WeakMap()
function activate(node) {
  if (!pending.has(node)) {
    const task = import('./landing-hydrate.tsx').then(({ hydrateLandingSample }) => {
      hydrateLandingSample(node)
      loaded.add(node)
    })
    pending.set(node, task)
  }
  return pending.get(node)
}
const proximity = new IntersectionObserver(entries => {
  for (const item of entries) if (item.isIntersecting) {
    proximity.unobserve(item.target)
    activate(item.target)
  }
}, { rootMargin: '240px' })
for (const sample of document.querySelectorAll('[data-landing-island]')) {
  proximity.observe(sample)
  sample.addEventListener('focusin', () => activate(sample), { once: true })
  sample.addEventListener('click', async event => {
    const button = event.target.closest('button')
    if (!button || loaded.has(sample)) return
    event.preventDefault()
    event.stopPropagation()
    await activate(sample)
    button.click()
  }, true)
}
