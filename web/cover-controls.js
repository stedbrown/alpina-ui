export function enhanceCover() {
  const toggle = document.getElementById('cover-guides-toggle')
  if (!toggle) return
  const guides = document.getElementById(toggle.getAttribute('aria-controls'))
  const update = () => { guides.hidden = !toggle.checked }
  toggle.addEventListener('change', update)
  update()
}
