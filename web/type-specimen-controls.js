import { moveButton } from 'alpina-ui/interactive/roving'

function enhanceSpecimen(region) {
  const disclosures = region.querySelector('[data-specimen-disclosures]')
  const template = region.querySelector('template')
  if (!disclosures || !template) return

  const tabs = Array.from(template.content.querySelectorAll('[role="tab"]'))
  const tablist = template.content.querySelector('[role="tablist"]')
  const panels = tabs.map((tab) => template.content.getElementById(tab.getAttribute('aria-controls')))
  const samples = tabs.map((tab) => disclosures.querySelector(`[data-specimen-sample][lang="${tab.dataset.alChoice}"]`))
  if (!tablist || !tabs.length || panels.includes(null) || samples.includes(null)) return

  function select(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
      panels[position].hidden = !selected
    })
  }

  const initial = Math.max(0, samples.findIndex((sample) => sample.closest('details').open))
  const hadFocus = disclosures.contains(document.activeElement)
  tabs.forEach((tab, index) => {
    panels[index].append(samples[index])
    tab.addEventListener('click', () => select(index))
  })
  tablist.addEventListener('keydown', (event) => {
    const next = moveButton(event, 'horizontal')
    if (next) select(tabs.indexOf(next))
  })
  select(initial)
  disclosures.replaceWith(template.content)
  template.remove()
  if (hadFocus) tabs[initial].focus()
}

const region = document.getElementById('type-specimen')
if (region) enhanceSpecimen(region)
