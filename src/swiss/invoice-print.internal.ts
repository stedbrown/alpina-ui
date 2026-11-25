/** Engines without intrinsic CSS rounding report their actual printed content size here. */
export function observeInvoicePrint(content: HTMLElement): () => void {
  const view = content.ownerDocument.defaultView
  if (!view || view.CSS.supports('height', 'calc-size(auto, round(up, size, 1px))')) return () => {}
  const media = view.matchMedia('print')
  function measure() {
    const pages = content.firstElementChild
    if (!media.matches || !pages) return
    const sheet = Math.ceil(297 * 96 / 25.4)
    const slip = 105 * 96 / 25.4
    const count = Math.ceil((pages.getBoundingClientRect().height + slip) / sheet)
    content.style.setProperty('--al-invoice-extent', count * sheet - slip + 'px')
    content.setAttribute('data-al-invoice-measured', '')
  }
  media.addEventListener('change', measure)
  measure()
  return () => {
    media.removeEventListener('change', measure)
    content.style.removeProperty('--al-invoice-extent')
    content.removeAttribute('data-al-invoice-measured')
  }
}
