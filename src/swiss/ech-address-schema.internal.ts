import type { SwissMessageLocale } from './locales.js'
import { addressLimits, isXmlAddressText } from './postal-address.js'
import { standardSchema, type SwissSchemaIssue } from './standard-schema.internal.js'

type Contact = { mrMrs?: '1' | '2'; title?: string; firstName?: string }
type Recipient =
  | { person: Contact & { lastName: string }; organisation?: never }
  | { organisation: Contact & { organisationName: string; organisationNameAddOn1?: string; organisationNameAddOn2?: string; lastName?: string }; person?: never }
type Postcode =
  | { swissZipCode: number; swissZipCodeAddOn?: string; swissZipCodeId?: number; foreignZipCode?: never }
  | { foreignZipCode?: string; swissZipCode?: never; swissZipCodeAddOn?: never; swissZipCodeId?: never }

/** JSON representation of eCH-0010 8.1 mailAddressType. Dates use civil YYYY-MM-DD. */
export type EchMailAddress = Recipient & {
  addressCategory?: 1 | 2
  otherAddressCategory?: string
  validity?: { dateFrom?: string; dateTo?: string }
  addressInformation: Postcode & {
    addressLine1?: string; addressLine2?: string; street?: string; houseNumber?: string; dwellingNumber?: string
    postOfficeBoxNumber?: number; postOfficeBoxText?: string; locality?: string; town: string
    country: { countryId?: number; countryIdISO2?: string; countryNameShort: string }
  }
}

const messages = {
  en: { field: 'Check the value of this address field.', required: 'This address field is required.', choice: 'Choose one of the permitted address alternatives.', unknown: 'Unknown address field.' },
  'de-CH': { field: 'Prüfen Sie den Wert dieses Adressfelds.', required: 'Dieses Adressfeld ist erforderlich.', choice: 'Wählen Sie eine der zulässigen Adressvarianten.', unknown: 'Unbekanntes Adressfeld.' },
  'fr-CH': { field: 'Vérifiez la valeur de ce champ d’adresse.', required: 'Ce champ d’adresse est obligatoire.', choice: 'Choisissez une des variantes d’adresse autorisées.', unknown: 'Champ d’adresse inconnu.' },
  'it-CH': { field: 'Verifica il valore di questo campo dell’indirizzo.', required: 'Questo campo dell’indirizzo è obbligatorio.', choice: 'Scegli una delle varianti di indirizzo consentite.', unknown: 'Campo dell’indirizzo sconosciuto.' },
  'rm-CH': { field: 'Controllai la valur da quest champ d’adressa.', required: 'Quest champ d’adressa è obligatoric.', choice: 'Tscherni ina da las variantas d’adressa admessas.', unknown: 'Champ d’adressa nunenconuschent.' },
} as const
type Message = keyof typeof messages.en
type RecordValue = Record<string, unknown>
type Rule = (value: unknown) => boolean
type Fields = Record<string, Rule>
function record(value: unknown): value is RecordValue {
  if (typeof value !== 'object' || value === null) return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}
function token(max: number): Rule {
  return value => {
    if (typeof value !== 'string') return false
    // xs:token collapses only the four XML whitespace characters. The original text is returned.
    const text = value.replace(/[ \t\r\n]+/g, ' ').replace(/^ | $/g, '')
    return !!text.trim() && [...text].length <= max && isXmlAddressText(text)
  }
}
function integer(min: number, max: number): Rule {
  return value => typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max
}
function civilDate(value: unknown): value is string {
  if (typeof value !== 'string' || value.startsWith('0000-') || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value + 'T00:00:00Z')
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
const contact = { mrMrs: (v: unknown) => v === '1' || v === '2', title: token(50), firstName: token(addressLimits.firstName), lastName: token(30) }
const organisation = { ...contact, organisationName: token(60), organisationNameAddOn1: token(60), organisationNameAddOn2: token(60) }
const address = {
  addressLine1: token(addressLimits.addressLine1), addressLine2: token(addressLimits.addressLine2), street: token(addressLimits.street),
  houseNumber: token(addressLimits.houseNumber), dwellingNumber: token(30), postOfficeBoxNumber: integer(0, 99999999),
  postOfficeBoxText: token(15), locality: token(addressLimits.locality), town: token(40), country: record,
  swissZipCode: integer(1000, 9999), swissZipCodeAddOn: (v: unknown) => typeof v === 'string' && /^\d{2}$/.test(v),
  swissZipCodeId: integer(-2147483648, 2147483647), foreignZipCode: token(15),
}
const country = { countryId: integer(1000, 9999), countryIdISO2: (v: unknown) => typeof v === 'string' && /^[A-Z]{2}$/.test(v), countryNameShort: token(50) }
const envelope = { person: record, organisation: record, addressInformation: record, validity: record, addressCategory: integer(1, 2), otherAddressCategory: token(100) }

/** Check person and organisation addresses at a trust boundary. Paths use the eCH interchange field names. */
export function echAddressSchema(locale: SwissMessageLocale = 'en') {
  return standardSchema<EchMailAddress, EchMailAddress>(value => {
    const issues: SwissSchemaIssue[] = []
    function issue(path: string[], reason: Message) { issues.push({ path, message: messages[locale][reason] }) }
    function fields(input: RecordValue, rules: Fields, path: string[], required: string[]) {
      for (const key of required) if (!Object.hasOwn(input, key)) issue([...path, key], 'required')
      for (const [key, field] of Object.entries(input)) {
        if (!Object.hasOwn(rules, key)) issue([...path, key], 'unknown')
        else if (!rules[key](field)) issue([...path, key], 'field')
      }
    }
    if (!record(value)) return { issues: [{ message: messages[locale].field }] }
    fields(value, envelope, [], ['addressInformation'])
    if (Object.hasOwn(value, 'person') === Object.hasOwn(value, 'organisation')) issue(['person'], 'choice')
    if (Object.hasOwn(value, 'addressCategory') && Object.hasOwn(value, 'otherAddressCategory')) issue(['otherAddressCategory'], 'choice')
    if (record(value.person)) fields(value.person, contact, ['person'], ['lastName'])
    if (record(value.organisation)) fields(value.organisation, organisation, ['organisation'], ['organisationName'])
    if (record(value.validity)) {
      fields(value.validity, { dateFrom: civilDate, dateTo: civilDate }, ['validity'], [])
      const { dateFrom, dateTo } = value.validity
      if (civilDate(dateFrom) && civilDate(dateTo) && dateFrom > dateTo) issue(['validity', 'dateTo'], 'field')
    }
    const info = value.addressInformation
    if (record(info)) {
      const path = ['addressInformation']
      fields(info, address, path, ['town', 'country'])
      const destination = record(info.country) ? info.country : undefined
      if (destination) {
        fields(destination, country, [...path, 'country'], ['countryNameShort'])
        if (destination.countryId != null && destination.countryIdISO2 != null &&
            (destination.countryId === 8100) !== (destination.countryIdISO2 === 'CH'))
          issue([...path, 'country', 'countryIdISO2'], 'field')
      }
      if (info.street === undefined && (info.houseNumber !== undefined || info.dwellingNumber !== undefined)) issue([...path, 'street'], 'required')
      if (info.postOfficeBoxNumber !== undefined && info.postOfficeBoxText === undefined) issue([...path, 'postOfficeBoxText'], 'required')
      if (info.swissZipCode !== undefined && info.foreignZipCode !== undefined) issue([...path, 'foreignZipCode'], 'choice')
      if (info.swissZipCode === undefined && (info.swissZipCodeAddOn !== undefined || info.swissZipCodeId !== undefined || destination?.countryIdISO2 === 'CH' || destination?.countryId === 8100)) issue([...path, 'swissZipCode'], 'required')
    }
    return issues.length ? { issues } : { value: value as EchMailAddress }
  })
}
