const tools = document.querySelector('#icon-tools')
const field = tools.content.querySelector('[data-icon-search]')
const size = tools.content.querySelector('[data-icon-size]')
const count = tools.content.querySelector('[data-icon-count]')
const clear = tools.content.querySelector('[data-icon-clear]')
const groups = [...document.querySelectorAll('[data-icon-group]')]

for (const tile of document.querySelectorAll('[data-icon-entry]')) {
  const control = tile.querySelector('[data-icon-copy]')
  const feedback = tile.querySelector('[data-icon-result]')
  const button = control.content.querySelector('button')
  const status = tile.querySelector('[data-icon-name]')
  const source = feedback.content.querySelector('input')
  control.replaceWith(control.content)
  let timer
  button.addEventListener('click', async () => {
    clearTimeout(timer)
    const code = '<Icon name="' + tile.dataset.iconEntry + '" size={' + size.value + '} />'
    source.remove()
    try {
      await navigator.clipboard.writeText(code)
      status.textContent = 'Copied JSX'
      timer = setTimeout(() => { status.textContent = tile.dataset.iconEntry }, 2200)
    } catch {
      status.textContent = 'Select and copy this JSX.'
      source.value = code
      feedback.before(source)
      source.focus()
      source.select()
    }
  })
}

function filter() {
  const words = field.value.trim().toLowerCase().split(/[\s-]+/).filter(Boolean)
  let total = 0
  for (const group of groups) {
    let visible = 0
    for (const tile of group.querySelectorAll('[data-icon-entry]')) {
      const text = [group.dataset.iconGroup, tile.dataset.iconEntry, tile.dataset.keywords].join(' ').toLowerCase()
      tile.hidden = !words.every(word => text.includes(word))
      if (!tile.hidden) visible++
    }
    group.hidden = visible === 0
    total += visible
  }
  count.textContent = total ? total + (total === 1 ? ' icon' : ' icons') : 'No matches. Try another name.'
  clear.disabled = !field.value
}

field.addEventListener('input', filter)
clear.addEventListener('click', () => { field.value = ''; filter(); field.focus() })
size.addEventListener('change', () => {
  for (const drawing of document.querySelectorAll('[data-icon-drawing]')) {
    drawing.setAttribute('width', size.value)
    drawing.setAttribute('height', size.value)
  }
})
tools.replaceWith(tools.content)
