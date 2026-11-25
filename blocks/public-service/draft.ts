import type { SwissMessageLocale } from 'alpina-ui'

export interface ServiceDraft {
  revision: string
  requestId: string
  step: number
  locale: SwissMessageLocale
  details: Record<string, string>
  attachments: File[]
}

export class DraftConflict extends Error {}

// IndexedDB's structured clone preserves File bytes, names, MIME types and modification dates.
export function accessDraft(key: string, change?: { previous: string | undefined; next?: ServiceDraft }): Promise<ServiceDraft | undefined> {
  return new Promise((resolve, reject) => {
    const open = indexedDB.open('alpina-public-service-v1', 1)
    let blocked = false
    open.onblocked = () => { blocked = true; reject(new Error('Draft store unavailable')) }
    open.onupgradeneeded = () => open.result.createObjectStore('drafts')
    open.onerror = () => reject(open.error)
    open.onsuccess = () => {
      const db = open.result
      if (blocked) { db.close(); return }
      const transaction = db.transaction('drafts', change ? 'readwrite' : 'readonly')
      const drafts = transaction.objectStore('drafts')
      const read = drafts.get(key)
      let result: ServiceDraft | undefined
      let conflict = false
      read.onsuccess = () => {
        result = read.result
        if (!change) return
        // Another tab may have saved a newer revision since this form opened.
        if (result?.revision !== change.previous) {
          conflict = true
          transaction.abort()
          return
        }
        result = change.next
        if (result) drafts.put(result, key)
        else drafts.delete(key)
      }
      transaction.oncomplete = () => { db.close(); resolve(result) }
      transaction.onabort = () => { db.close(); reject(conflict ? new DraftConflict() : transaction.error) }
    }
  })
}

