// Keep this function self-contained so the same behavior can run in <head> before first paint.
export function initializeTheme() {
  const root = document.documentElement
  if (root.hasAttribute('data-al-theme-ready')) return
  root.setAttribute('data-al-theme-ready', '')
  const key = 'alpina-catalog-theme'
  function apply(mode: string | null) {
    root.dataset.alTheme = mode === 'light' || mode === 'dark' ? mode : 'auto'
  }
  try { apply(localStorage.getItem(key)) } catch { apply('auto') }
  document.addEventListener('click', event => {
    if (event.defaultPrevented || !(event.target instanceof Element) || !event.target.closest('[data-al-theme-toggle]')) return
    const next = root.dataset.alTheme === 'auto' ? 'light' : root.dataset.alTheme === 'light' ? 'dark' : 'auto'
    apply(next)
    try { localStorage.setItem(key, next) } catch { /* The local preference still works when storage is unavailable. */ }
  })
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(event.newValue)
  })
}

/** Optional inline head script for static or server-rendered documents. Respects a previously saved choice before paint. */
export const themeInitializationScript = '(' + initializeTheme.toString() + ')()'
