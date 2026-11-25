const pending = new WeakMap<Document, () => void>()

/** Print one mounted Letter or InvoiceDocument from inside a larger application. */
export function printSwissDocument(element: HTMLElement): void {
  const document = element.ownerDocument
  const view = document.defaultView
  if (!view || !element.isConnected || !element.matches('.al-letter, .al-invoice-document'))
    throw new TypeError('Pass the mounted article from a Letter or InvoiceDocument ref.')
  pending.get(document)?.()
  const ancestors: HTMLElement[] = []
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    ancestors.push(parent)
    parent.setAttribute('data-al-document-path', '')
  }
  element.setAttribute('data-al-document-target', '')
  function restore() {
    element.removeAttribute('data-al-document-target')
    for (const parent of ancestors) parent.removeAttribute('data-al-document-path')
    view?.removeEventListener('afterprint', restore)
    pending.delete(document)
  }
  pending.set(document, restore)
  view.addEventListener('afterprint', restore)
  try { view.print() } catch (error) { restore(); throw error }
}
