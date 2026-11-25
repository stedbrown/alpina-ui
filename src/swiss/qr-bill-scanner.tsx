'use client'
import { forwardRef, useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'
import { Button } from '../ui/button.js'
import { DescriptionList } from '../ui/description-list.js'
import { Field } from '../ui/field.js'
import { FileInput } from '../ui/file-input.js'
import { Stack } from '../ui/stack.js'
import { Typography } from '../ui/typography.js'
import { formatSwissNumber } from './format-swiss-number.js'
import type { SwissLocale } from './locales.js'
import type { SwissQrAddress, SwissQrBillData } from './qr-payment.js'
import { parseSwissQrPayload, SwissQrPayloadError } from './parse-swiss-qr-payload.js'
import { cameraPayload, nativeQrDetector, readQrFile } from './qr-reader.internal.js'
import { scannerLabels } from './qr-scanner-labels.internal.js'
import './qr-bill-scanner.css'

export { preloadQrBillScanner } from './qr-reader.internal.js'

export interface QrBillScannerProps extends Omit<ComponentPropsWithoutRef<'section'>, 'children' | 'onConfirm'> {
  locale?: SwissLocale | 'en'
  /** Called once, only after the reader confirms the validated summary. */
  onConfirm?: (bill: SwissQrBillData) => void
}
type Stage = 'idle' | 'reading' | 'camera' | 'review' | 'confirmed'
function displayAddress(address: SwissQrAddress) {
  return [address.name, [address.street, address.buildingNumber].filter(Boolean).join(' '),
    address.postalCode + ' ' + address.town, address.country].filter(Boolean).join(', ')
}
export const QrBillScanner = forwardRef<HTMLElement, QrBillScannerProps>(function QrBillScanner(
  { locale = 'de-CH', onConfirm, className = '', ...props }, ref,
) {
  const t = scannerLabels[locale]
  const [stage, setStage] = useState<Stage>('idle')
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ bill: SwissQrBillData; page?: number; warnings: string[] }>()
  const operation = useRef<AbortController | null>(null)
  const video = useRef<HTMLVideoElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])
  const review = useRef<HTMLHeadingElement>(null)
  const nextSlip = useRef<HTMLButtonElement>(null)
  const confirmed = useRef(false)
  const busy = stage === 'reading' || stage === 'camera'
  useEffect(() => () => operation.current?.abort(), [])
  useEffect(() => {
    if (stage === 'review') review.current?.focus()
    if (stage === 'confirmed') nextSlip.current?.focus()
  }, [stage])
  function reset() {
    operation.current?.abort()
    operation.current = null
    confirmed.current = false
    setError('')
    setStage('idle')
    setResult(undefined)
  }
  function begin(next: Stage) {
    reset()
    const controller = new AbortController()
    operation.current = controller
    setStage(next)
    return controller
  }
  function failure(controller: AbortController, message: string) {
    if (controller.signal.aborted) return
    reset()
    setError(message)
  }
  function found(controller: AbortController, raw: string, page?: number) {
    if (controller.signal.aborted) return
    try {
      const warnings: string[] = []
      const bill = parseSwissQrPayload(raw, { locale, onAdditionalError: issue => warnings.push(issue.message) })
      controller.abort()
      setResult({ bill, page, warnings })
      setStage('review')
    } catch (reason) {
      failure(controller, reason instanceof SwissQrPayloadError ? reason.message : t.invalid)
    }
  }
  async function openFile(file: File) {
    const controller = begin('reading')
    try {
      const read = await readQrFile(file, controller.signal)
      if (read) found(controller, read.raw, read.page)
      else failure(controller, t.missing)
    } catch (reason) {
      const detail = reason instanceof Error ? reason : undefined
      failure(controller, detail?.name === 'PasswordException' ? t.encrypted : detail?.message === 'file_size' ? t.large : t.invalid)
    }
  }
  async function openCamera() {
    setFiles([])
    const controller = begin('camera')
    const { signal } = controller
    const leave = () => { if (!signal.aborted) reset() }
    window.addEventListener('pagehide', leave, { once: true, signal })
    document.addEventListener('visibilitychange', () => { if (document.hidden) leave() }, { signal })
    try {
      const detector = await nativeQrDetector()
      if (signal.aborted) return
      if (!detector || !navigator.mediaDevices?.getUserMedia) { failure(controller, t.unavailable); return }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      const player = video.current
      function stop() {
        for (const track of stream.getTracks()) track.stop()
        if (player && player.srcObject === stream) player.srcObject = null
      }
      if (!player || signal.aborted) { stop(); return }
      signal.addEventListener('abort', stop, { once: true })
      for (const track of stream.getVideoTracks()) track.addEventListener('ended', () => failure(controller, t.denied), { once: true, signal })
      player.srcObject = stream
      await player.play()
      let timer: ReturnType<typeof setTimeout>
      signal.addEventListener('abort', () => clearTimeout(timer), { once: true })
      async function tick() {
        if (signal.aborted || !player || !detector) return
        try {
          if (player.readyState >= 2) {
            const raw = await cameraPayload(detector, player)
            if (raw) { found(controller, raw); return }
          }
          if (!signal.aborted) timer = setTimeout(tick, 250)
        } catch { failure(controller, t.denied) }
      }
      void tick()
    } catch { failure(controller, t.denied) }
  }
  function cancel() {
    setFiles([])
    reset()
    fileInput.current?.focus()
  }
  const bill = result?.bill
  const exact = (value: string) => <bdi className="al-qr-value">{value}</bdi>
  function amount(payment: SwissQrBillData) {
    if (payment.amount === undefined) return payment.currency + ' · ' + t.open
    const digits = formatSwissNumber(payment.amount, locale, { minimumFractionDigits: 2 })
    return exact(locale === 'fr-CH' ? digits + '\u00a0' + payment.currency : payment.currency + '\u00a0' + digits)
  }
  const details = bill ? [
    { term: t.creditor, detail: displayAddress(bill.creditor) },
    { term: 'IBAN', detail: exact(bill.iban.match(/.{1,4}/g)!.join(' ')) },
    { term: t.amount, detail: amount(bill) },
    ...(bill.debtor ? [{ term: t.debtor, detail: displayAddress(bill.debtor) }] : []),
    ...(bill.reference?.value ? [{ term: t.reference, detail: exact(bill.reference.type + ' · ' + bill.reference.value) }] : []),
    ...(bill.message ? [{ term: t.message, detail: bill.message }] : []),
    ...(bill.billingInformation ? [{ term: t.billing, detail: bill.billingInformation }] : []),
    ...(bill.alternativeProcedures?.length ? [{ term: t.alternatives, detail: bill.alternativeProcedures.join(' · ') }] : []),
    ...(result.page ? [{ term: t.page, detail: String(result.page) }] : []),
  ] : []
  return <section {...props} ref={ref} className={('al-qr-scanner ' + className).trim()} lang={locale}
    aria-label={props['aria-label'] ?? t.scan} onKeyDown={event => {
      props.onKeyDown?.(event)
      if (!event.defaultPrevented && event.key === 'Escape' && (busy || stage === 'review')) { event.preventDefault(); cancel() }
    }}>
    <Stack gap={4}>
      <Field label={t.file} description={t.hint}>
        {control => <FileInput {...control} ref={fileInput} locale={locale} files={files}
          accept="image/png,image/jpeg,image/webp,application/pdf,.png,.jpg,.jpeg,.webp,.pdf"
          onFilesChange={next => {
            setFiles(next)
            if (next[0]) void openFile(next[0])
            else reset()
          }} />}
      </Field>
      <Stack direction="row" gap={2}>
        {busy ? <Button variant="outline" onClick={cancel}>{t.stop}</Button> :
          <Button variant="outline" onClick={() => void openCamera()}>{t.camera}</Button>}
      </Stack>
      <video ref={video} hidden={stage !== 'camera'} muted playsInline aria-label={t.aiming} />
      <div className="al-qr-progress" role="status">{busy ? (stage === 'camera' ? t.aiming : t.reading) : stage === 'confirmed' ? t.done : ''}</div>
      {error && <div role="alert">{error}</div>}
      {bill && <Stack gap={3}>
        <h3 ref={review} tabIndex={-1}>{t.preview}</h3>
        {bill.amount === '0.00' && <Typography>{t.nonpayable}</Typography>}
        <DescriptionList items={details} />
        {!!result.warnings.length && <div><Typography variant="label">{t.omitted}</Typography>
          <ul>{result.warnings.map(warning => <li key={warning}>{warning}</li>)}</ul></div>}
        <Stack direction="row" gap={2}>
          {stage === 'review' && <Button onClick={() => {
            if (confirmed.current) return
            confirmed.current = true
            setStage('confirmed')
            onConfirm?.(bill)
          }}>{t.confirm}</Button>}
          <Button ref={nextSlip} variant="outline" onClick={cancel}>{t.again}</Button>
        </Stack>
      </Stack>}
    </Stack>
  </section>
})
