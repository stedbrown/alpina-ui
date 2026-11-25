// Both parts of PDF.js are installed locally. Importing the matching message handler
// makes its in-process worker available even in a self-contained, offline HTML file.
import { getDocument } from 'pdfjs-dist'
import 'pdfjs-dist/build/pdf.worker.mjs'
// TypeScript has no built-in declaration for ECMAScript byte-module imports.
// @ts-expect-error PDF.js distributes the decoder as a binary asset.
import faxBytes from 'pdfjs-dist/wasm/jbig2.wasm' with { type: 'bytes' }
// @ts-expect-error PDF.js distributes the decoder as a binary asset.
import jpegBytes from 'pdfjs-dist/wasm/openjpeg.wasm' with { type: 'bytes' }

declare const __ALPINA_PDF_FALLBACKS__: boolean | undefined

class LocalPdfResources {
  async fetch({ kind, filename }: { kind: string; filename: string }): Promise<Uint8Array> {
    if (kind === 'wasmUrl' && filename === 'jbig2.wasm') return faxBytes.slice()
    if (kind === 'wasmUrl' && filename === 'openjpeg.wasm') return jpegBytes.slice()
    // Embedded PDF resources and device fonts suffice to locate a payment code.
    throw new Error('External PDF resources are unavailable')
  }
}

export async function readQrPdf(file: File, scan: (canvas: HTMLCanvasElement) => Promise<string | undefined>, signal: AbortSignal) {
  const data = new Uint8Array(await file.arrayBuffer())
  signal.throwIfAborted()
  // Package builds include both JavaScript image decoders. Plain source copies use local byte modules.
  const resources = typeof __ALPINA_PDF_FALLBACKS__ === 'undefined'
    ? { BinaryDataFactory: LocalPdfResources, useWasm: true } : { useWasm: false }
  const task = getDocument({ data, ...resources, useWorkerFetch: false, useSystemFonts: true,
    disableFontFace: true, enableXfa: false, disableAutoFetch: true, disableRange: true, disableStream: true,
    maxImageSize: 32_000_000, verbosity: 0 })
  const abort = () => { void task.destroy().catch(() => {}) }
  signal.addEventListener('abort', abort, { once: true })
  try {
    const pdf = await task.promise
    // A multi-page invoice normally puts its payment slip on the final page.
    for (let number = pdf.numPages; number >= 1; number--) {
      signal.throwIfAborted()
      const page = await pdf.getPage(number)
      const original = page.getViewport({ scale: 1 })
      const viewport = page.getViewport({ scale: Math.min(3, 2400 / Math.max(original.width, original.height)) })
      const canvas = document.createElement('canvas')
      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)
      try {
        await page.render({ canvas, viewport }).promise
        signal.throwIfAborted()
        const raw = await scan(canvas)
        if (raw) return { raw, page: number }
      } finally {
        canvas.width = canvas.height = 0
        page.cleanup()
      }
    }
  } finally {
    signal.removeEventListener('abort', abort)
    await task.destroy()
  }
}
