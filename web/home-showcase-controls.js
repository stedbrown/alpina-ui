import { enhanceCover } from './cover-controls.js'
import { enhanceSpecimen } from './type-specimen-controls.js'

enhanceCover()

const specimen = document.getElementById('type-specimen')
if (specimen) enhanceSpecimen(specimen)

const gridSwitch = document.getElementById('show-grid')
gridSwitch?.addEventListener('change', () => {
  document.getElementById('programme-guides').hidden = !gridSwitch.checked
})

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
