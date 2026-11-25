import { observeInvoicePrint } from './invoice-print.internal.js'
import { isolateDocument } from './document-print-scope.internal.js'

const pending = new WeakMap<Document, () => void>()

/** Print one mounted Letter or InvoiceDocument from inside a larger application. */
export function printSwissDocument(element: HTMLElement): void {
  const document = element.ownerDocument
  const view = document.defaultView
  if (!view || !element.isConnected || !element.matches('.al-letter, .al-invoice-document'))
    throw new TypeError('Pass the mounted article from a Letter or InvoiceDocument ref.')
  pending.get(document)?.()
  const release = isolateDocument(element)
  const content = element.querySelector<HTMLElement>('.al-invoice-content')
  const releaseMeasurement = content && observeInvoicePrint(content)
  function restore() {
    releaseMeasurement?.()
    release()
    view?.removeEventListener('afterprint', restore)
    pending.delete(document)
  }
  pending.set(document, restore)
  view.addEventListener('afterprint', restore)
  try { view.print() } catch (error) { restore(); throw error }
}
