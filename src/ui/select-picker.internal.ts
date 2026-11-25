// Older engines can style an inline listbox but cannot style a popup select.
// Keep the original select as the sole submitted control and source of truth.
export function installSelectPicker(root: Document) {
  if (CSS.supports('appearance', 'base-select')) return () => {}
  const lifetime = new AbortController()
  let sequence = 0
  let closePicker: (() => void) | undefined

  function open(event: Event) {
    if (!(event.target instanceof HTMLSelectElement)) return
    const select = event.target
    if (!select.classList.contains('al-select') ||
      select.matches(':disabled') || select.multiple || select.size > 1 || event.defaultPrevented) return
    if (event instanceof PointerEvent && event.button !== 0) return
    if (event instanceof KeyboardEvent &&
      !['ArrowDown', 'ArrowUp', 'F4', 'Enter', ' '].includes(event.key)) return
    event.preventDefault()
    if (select.getAttribute('aria-expanded') === 'true') return
    closePicker?.()

    const session = new AbortController()
    const { signal } = session
    const list = root.createElement('select')
    do { list.id = 'al-select-popup-' + ++sequence } while (root.getElementById(list.id))
    list.className = 'al-select-popup'
    list.size = Math.max(2, Math.min(9, select.options.length + select.querySelectorAll('optgroup').length))
    list.tabIndex = -1
    const label = select.getAttribute('aria-labelledby')
    if (label) list.setAttribute('aria-labelledby', label)
    else list.setAttribute('aria-label', select.getAttribute('aria-label') ||
      Array.from(select.labels ?? [], item => item.textContent?.trim()).filter(Boolean).join(' '))
    list.lang = select.lang || select.closest('[lang]')?.getAttribute('lang') || ''
    list.dir = getComputedStyle(select).direction === 'rtl' ? 'rtl' : 'ltr'
    for (const child of select.children) {
      if (!child.matches('option,optgroup')) continue
      const copy = child.cloneNode(true) as HTMLElement
      copy.removeAttribute('id')
      for (const item of copy.querySelectorAll('[id]')) item.removeAttribute('id')
      list.append(copy)
    }
    list.selectedIndex = select.selectedIndex
    if (typeof list.showPopover === 'function') list.popover = 'manual'
    select.after(list)
    if (list.popover) list.showPopover()

    const controls = select.getAttribute('aria-controls')
    select.setAttribute('aria-controls', [controls, list.id].filter(Boolean).join(' '))
    const expanded = select.getAttribute('aria-expanded')
    select.setAttribute('aria-expanded', 'true')
    function close(restoreFocus = false) {
      if (signal.aborted) return
      session.abort()
      observer.disconnect()
      list.remove()
      if (controls === null) select.removeAttribute('aria-controls')
      else select.setAttribute('aria-controls', controls)
      if (expanded === null) select.removeAttribute('aria-expanded')
      else select.setAttribute('aria-expanded', expanded)
      closePicker = undefined
      if (restoreFocus && select.isConnected) select.focus()
    }
    function commitValue() {
      const index = list.selectedIndex
      const option = select.options[index]
      if (option && !select.matches(':disabled') && !option.matches(':disabled') &&
          select.selectedIndex !== index) {
        select.selectedIndex = index
        select.dispatchEvent(new Event('input', { bubbles: true }))
        select.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
    function position() {
      const rect = select.getBoundingClientRect()
      const below = window.innerHeight - rect.bottom - 4
      const above = rect.top - 4
      list.style.width = rect.width + 'px'
      list.style.maxHeight = Math.max(0, Math.max(below, above)) + 'px'
      list.style.left = rect.left + 'px'
      list.style.top = (below >= list.offsetHeight || below >= above ? rect.bottom + 4 :
        Math.max(0, rect.top - list.offsetHeight - 4)) + 'px'
    }
    const observer = new MutationObserver(() => {
      if (!select.isConnected || select.matches(':disabled') || !list.isConnected) close()
    })
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] })
    // Prevent a reordered option list from committing a stale index.
    const optionsObserver = new MutationObserver(() => close(true))
    optionsObserver.observe(select, { childList: true, characterData: true, subtree: true, attributes: true,
      attributeFilter: ['value', 'label', 'disabled', 'selected', 'multiple', 'size'] })
    signal.addEventListener('abort', () => optionsObserver.disconnect(), { once: true })
    closePicker = close
    position()
    list.focus({ preventScroll: true })
    list.addEventListener('click', e => {
      if (e.target instanceof HTMLOptionElement && !e.target.matches(':disabled')) {
        commitValue()
        close(true)
      }
    }, { signal })
    list.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(true) }
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        commitValue()
        close(true)
      }
      if (e.key === 'Tab') {
        commitValue()
        // Let the browser move focus through its own tab order. On backwards
        // traversal skip the trigger immediately before this temporary list.
        if (e.shiftKey) {
          const index = select.getAttribute('tabindex')
          select.tabIndex = -1
          signal.addEventListener('abort', () => {
            if (index === null) select.removeAttribute('tabindex')
            else select.setAttribute('tabindex', index)
          }, { once: true })
        }
      }
    }, { signal })
    list.addEventListener('blur', () => close(), { signal })
    root.addEventListener('pointerdown', e => {
      if (e.target instanceof Node && !list.contains(e.target) && e.target !== select) close()
    }, { capture: true, signal })
    root.addEventListener('scroll', position, { capture: true, signal })
    window.addEventListener('resize', position, { signal })
  }

  for (const event of ['pointerdown', 'click', 'keydown']) {
    root.addEventListener(event, open, { signal: lifetime.signal })
  }
  return () => { closePicker?.(); lifetime.abort() }
}
