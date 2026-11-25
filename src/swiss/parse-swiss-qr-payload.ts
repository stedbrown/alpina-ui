import { SwissQrValidationError, prepareSwissQrBill, type SwissQrAddress, type SwissQrBillData } from './qr-payment.js'
import type { SwissLocale } from './locales.js'

type Locale = SwissLocale | 'en'
const addressKeys = ['type', 'name', 'street', 'buildingNumber', 'postalCode', 'town', 'country']
const fields = ['header', 'version', 'encoding', 'iban', ...addressKeys.map(key => 'creditor.' + key),
  ...addressKeys.map(key => 'ultimateCreditor.' + key), 'amount', 'currency', ...addressKeys.map(key => 'debtor.' + key),
  'reference.type', 'reference.value', 'message', 'trailer', 'billingInformation', 'alternativeProcedures.0', 'alternativeProcedures.1']

function labels(line: string, separators: string, count: string, capacity: string, expected: string, empty: string, format: string, decimal: string) {
  return { line, separators, count, capacity, expected, empty, format, decimal }
}
const words = {
  en: labels('Line', 'Use one LF or CRLF between fields and at most one at the end.', 'Expected 31–34 payment fields.', 'The payment text exceeds Swiss QR capacity.', 'Expected', 'Leave this field empty.', 'Use the wire format without padding or grouping spaces.', 'Use a decimal point and exactly two decimal places.'),
  'de-CH': labels('Zeile', 'Einheitlich LF oder CRLF verwenden, am Ende höchstens einmal.', '31–34 Zahlungsfelder erwartet.', 'Die Zahlungsdaten sind für den Swiss QR Code zu lang.', 'Erwartet', 'Dieses Feld leer lassen.', 'Das Datenformat ohne Füllzeichen oder Gruppierungsleerzeichen verwenden.', 'Einen Dezimalpunkt und genau zwei Nachkommastellen verwenden.'),
  'fr-CH': labels('Ligne', 'Utilisez le même séparateur LF ou CRLF, une seule fois au maximum à la fin.', '31 à 34 champs de paiement sont attendus.', 'Les données dépassent la capacité du Swiss QR Code.', 'Valeur attendue', 'Laissez ce champ vide.', 'Utilisez le format sans remplissage ni espaces de groupement.', 'Utilisez un point et exactement deux décimales.'),
  'it-CH': labels('Riga', 'Usare sempre LF o CRLF, al massimo una volta alla fine.', 'Sono previsti da 31 a 34 campi di pagamento.', 'I dati superano la capacità dello Swiss QR Code.', 'Valore richiesto', 'Lasciare vuoto questo campo.', 'Usare il formato senza riempimento o spazi di raggruppamento.', 'Usare un punto e due cifre decimali.'),
  'rm-CH': labels('Lingia', 'Duvrai dapertut LF u CRLF, maximalmain ina giada a la fin.', 'I dovra da 31 fin 34 champs da pajament.', 'Las datas surpassan la capacitad dal Swiss QR Code.', 'Valur spetgada', 'Laschai vid quest champ.', 'Duvrai il format senza segns d’emplenida u spazis da gruppaziun.', 'Duvrai in punct e precis duas cifras decimalas.'),
} satisfies Record<Locale, ReturnType<typeof labels>>

/** A wire-format error with its stable field, code and one-based SIX line number when applicable. */
export class SwissQrPayloadError extends RangeError {
  constructor(readonly code: string, readonly field: string, readonly line: number | undefined, detail: string, locale: Locale = 'en') {
    super(line ? words[locale].line + ' ' + line + ' (' + field + '): ' + detail : detail)
    this.name = 'SwissQrPayloadError'
  }
}

export interface ParseSwissQrPayloadOptions {
  locale?: Locale
  /** Accept a valid payment core, omit invalid additional fields (SIX status A), and report each omission. */
  onAdditionalError?: (issue: SwissQrPayloadError) => void
}

/** Reads and validates a SIX IG 2.4 payment payload before it is offered for confirmation. */
export function parseSwissQrPayload(payload: string, { locale = 'en', onAdditionalError }: ParseSwissQrPayloadOptions = {}): SwissQrBillData {
  const text = words[locale]
  function fail(code: string, message: string, line?: number): never {
    throw new SwissQrPayloadError(code, fields[(line ?? 0) - 1] ?? 'payload', line, message, locale)
  }
  if (typeof payload !== 'string') fail('fields', text.count)
  if (payload.length > 997 || new TextEncoder().encode(payload).length > 997) fail('capacity', text.capacity)
  if (/\r(?!\n)/u.test(payload) || (payload.includes('\r\n') && /(?<!\r)\n/u.test(payload)) || /\n(?:\r?\n)$/.test(payload))
    fail('separators', text.separators)
  const lines = payload.replace(/\r?\n$/, '').split(/\r?\n/)
  if (lines.length < 31 || lines.length > 34) fail('fields', text.count)
  function expected(line: number, value: string) {
    if (lines[line - 1] !== value) fail('literal', text.expected + ' ' + value + '.', line)
  }
  expected(1, 'SPC')
  expected(2, '0200')
  expected(3, '1')
  expected(5, 'S')
  expected(31, 'EPD')
  for (let line = 12; line <= 18; line++) if (lines[line - 1]) fail('reserved', text.empty, line)
  function checkText(i: number) {
    if (lines[i].trim() !== lines[i] || lines[i].normalize('NFC') !== lines[i]) fail('format', text.format, i + 1)
  }
  for (let i = 0; i < 31; i++) checkText(i)
  if (!/^[A-Z0-9]+$/.test(lines[3])) fail('format', text.format, 4)
  for (const n of [11, 27]) if (lines[n - 1] && !/^[A-Z]{2}$/.test(lines[n - 1])) fail('format', text.format, n)
  if (/\s/u.test(lines[28])) fail('format', text.format, 29)
  if (lines[18] && !/^(?:0|[1-9]\d{0,8})\.\d{2}$/.test(lines[18])) fail('decimal', text.decimal, 19)
  function address(start: number): SwissQrAddress {
    return { name: lines[start], street: lines[start + 1], buildingNumber: lines[start + 2],
      postalCode: lines[start + 3], town: lines[start + 4], country: lines[start + 5] }
  }
  const hasDebtor = lines.slice(20, 27).some(Boolean)
  if (hasDebtor) expected(21, 'S')
  const currency = lines[19]
  if (currency !== 'CHF' && currency !== 'EUR') fail('currency', text.expected + ' CHF / EUR.', 20)
  const type = lines[27]
  if (type !== 'NON' && type !== 'QRR' && type !== 'SCOR') fail('reference_type', text.expected + ' NON / QRR / SCOR.', 28)
  if (type === 'NON' && lines[28]) fail('reference_empty', text.empty, 29)
  const bill: SwissQrBillData = {
    iban: lines[3], creditor: address(5), currency,
    ...(hasDebtor && { debtor: address(21) }), ...(lines[18] && { amount: lines[18] }),
    reference: type === 'NON' ? { type } : { type, value: lines[28] },
    ...(lines[29] && { message: lines[29] }),
  }
  function validate(candidate: SwissQrBillData, additionalLine?: number) {
    try {
      prepareSwissQrBill(candidate, locale)
    } catch (error) {
      if (!(error instanceof SwissQrValidationError)) throw error
      const line = additionalLine ?? (fields.indexOf(error.field) + 1 || undefined)
      throw new SwissQrPayloadError(error.code, line ? fields[line - 1] : error.field, line, error.message, locale)
    }
  }
  validate(bill)
  for (let i = 31; i < lines.length; i++) {
    if (i === 31 && !lines[i]) continue
    try {
      checkText(i)
      const addition = i === 31 ? { billingInformation: lines[i] } :
        { alternativeProcedures: [...bill.alternativeProcedures ?? [], lines[i]] }
      validate({ ...bill, ...addition }, i + 1)
      Object.assign(bill, addition)
    } catch (error) {
      if (!onAdditionalError || !(error instanceof SwissQrPayloadError)) throw error
      onAdditionalError(error)
    }
  }
  return bill
}
