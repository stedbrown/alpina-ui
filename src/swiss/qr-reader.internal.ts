import { loadQrImageReader, loadQrPdfReader } from './qr-reader-loader.internal.js'

/** Loads both local decoder modules so a mounted scanner can read future files without a network connection. */
export async function preloadQrBillScanner(): Promise<void> {
  await Promise.all([loadQrImageReader(), loadQrPdfReader()])
}

interface Detector { detect(source: CanvasImageSource): Promise<{ rawValue: string }[]> }
interface DetectorConstructor {
  new(options: { formats: string[] }): Detector
  getSupportedFormats?(): Promise<string[]>
}

export async function nativeQrDetector(): Promise<Detector | undefined> {
  const Native = (globalThis as typeof globalThis & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector
  if (!Native) return
  try {
    if (Native.getSupportedFormats && !(await Native.getSupportedFormats()).includes('qr_code')) return
    return new Native({ formats: ['qr_code'] })
  } catch { return undefined }
}

export async function cameraPayload(detector: Detector, video: HTMLVideoElement) {
  return (await detector.detect(video)).find(code => /^SPC(?:\r?\n|$)/.test(code.rawValue))?.rawValue
}

export async function readQrFile(file: File, signal: AbortSignal): Promise<{ raw: string; page?: number } | undefined> {
  const detector = await nativeQrDetector()
  async function scan(canvas: HTMLCanvasElement) {
    signal.throwIfAborted()
    if (detector) {
      try {
        const raw = (await detector.detect(canvas)).find(code => /^SPC(?:\r?\n|$)/.test(code.rawValue))?.rawValue
        if (raw) return raw
      } catch { /* Some platforms expose a detector but cannot process canvases. */ }
    }
    const { readQrPixels } = await loadQrImageReader()
    signal.throwIfAborted()
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas unavailable')
    return readQrPixels(context.getImageData(0, 0, canvas.width, canvas.height))
  }
  if (file.size > 64 * 1024 * 1024) throw new RangeError('file_size')
  const header = await file.slice(0, 5).text()
  if (header === '%PDF-' || file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const { readQrPdf } = await loadQrPdfReader()
    signal.throwIfAborted()
    return readQrPdf(file, scan, signal)
  }
  // Decode only raster formats, so a supplied SVG cannot introduce linked resources.
  if (!/^(?:image\/(?:png|jpeg|webp)|)$/.test(file.type) ||
    (!file.type && !/\.(png|jpe?g|webp)$/i.test(file.name))) throw new RangeError('file_type')
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  try {
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height))
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) throw new Error('Canvas unavailable')
    context.fillStyle = 'white'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    const raw = await scan(canvas)
    return raw ? { raw } : undefined
  } finally {
    bitmap.close()
    canvas.width = canvas.height = 0
  }
}
