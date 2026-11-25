/** Flatten only the chosen document's ancestors. The original DOM remains mounted. */
export function isolateDocument(element: HTMLElement): () => void {
  const ancestors: HTMLElement[] = []
  for (let parent = element.parentElement; parent; parent = parent.parentElement) {
    ancestors.push(parent)
    parent.setAttribute('data-al-document-path', '')
  }
  element.setAttribute('data-al-document-target', '')
  return () => {
    element.removeAttribute('data-al-document-target')
    for (const parent of ancestors) parent.removeAttribute('data-al-document-path')
  }
}

const managed = new WeakMap<Document, { count: number; dispose: () => void }>()

/** Decide before the print stylesheet changes visibility or application layout. */
export function registerDocumentPrint(document: Document): () => void {
  const view = document.defaultView
  if (!view) return () => {}
  let registration = managed.get(document)
  if (!registration) {
    let restore: (() => void) | undefined
    function before() {
      if (document.documentElement.matches('[data-al-document-path], [data-al-qr-print-path]')) return
      const candidates = Array.from(document.querySelectorAll<HTMLElement>('.al-letter, .al-invoice-document')).filter(article =>
        !article.closest('[hidden], [aria-hidden="true"], dialog:not([open]), details:not([open])') &&
        (article.checkVisibility ? article.checkVisibility({ visibilityProperty: true, opacityProperty: true })
          : article.getClientRects().length > 0 && view!.getComputedStyle(article).visibility === 'visible'))
      if (candidates.length === 1) restore = isolateDocument(candidates[0])
    }
    function after() { restore?.(); restore = undefined }
    document.body.setAttribute('data-al-document-managed', '')
    view.addEventListener('beforeprint', before)
    view.addEventListener('afterprint', after)
    registration = { count: 0, dispose() {
      view.removeEventListener('beforeprint', before)
      view.removeEventListener('afterprint', after)
      document.body.removeAttribute('data-al-document-managed')
      after()
    } }
    managed.set(document, registration)
  }
  registration.count++
  return () => {
    if (--registration.count === 0) {
      registration.dispose()
      managed.delete(document)
    }
  }
}
