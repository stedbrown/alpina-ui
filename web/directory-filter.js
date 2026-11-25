const template = document.getElementById('component-filter')
if (template) {
  const field = template.content.querySelector('input')
  const reset = template.content.querySelector('button')
  const status = template.content.querySelector('[data-filter-count]')
  const groups = [...document.querySelectorAll('[data-directory-group]')]
  const fold = (value) => value.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
  const entries = groups.map((group) => [...group.querySelectorAll('[data-directory-entry]')].map((item) => ({
    item, text: fold(item.dataset.directoryEntry),
  })))
  function filter() {
    const words = fold(field.value).trim().split(/\s+/).filter(Boolean)
    let count = 0
    groups.forEach((group, index) => {
      let matches = 0
      for (const { item, text } of entries[index]) {
        item.hidden = !words.every((word) => text.includes(word))
        if (!item.hidden) matches++
      }
      group.hidden = matches === 0
      count += matches
    })
    reset.disabled = field.value.length === 0
    status.textContent = count === 0 ? 'No matches. Try another name or clear the search.' : count + (count === 1 ? ' component' : ' components')
  }
  field.addEventListener('input', filter)
  reset.addEventListener('click', () => { field.value = ''; filter(); field.focus() })
  template.replaceWith(template.content)
  filter()
}
