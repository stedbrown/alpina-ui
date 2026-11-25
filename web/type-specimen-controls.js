import { moveButton } from 'alpina-ui/interactive/roving'

export function enhanceSpecimen(region) {
  const tablist = region.querySelector('[role="tablist"]')
  const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'))
  const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')))

  function select(index) {
    tabs.forEach((tab, position) => {
      const selected = position === index
      tab.setAttribute('aria-selected', String(selected))
      tab.tabIndex = selected ? 0 : -1
      panels[position].hidden = !selected
    })
  }

  tabs.forEach((tab, index) => tab.addEventListener('click', () => select(index)))
  tablist.addEventListener('keydown', (event) => {
    const next = moveButton(event, 'horizontal')
    if (next) select(tabs.indexOf(next))
  })
}
