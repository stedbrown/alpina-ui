import type { EchMailAddress } from './ech-address-schema.internal.js'
import type { SwissQrAddress } from './qr-payment.js'
import { defaultSwissLocale, type SwissMessageLocale } from './locales.js'

function line(...parts: (string | number | undefined)[]): string {
  return parts.filter(part => part !== undefined && part !== '').join(' ').trim()
}

function countryLine(code: string | undefined, locale: SwissMessageLocale, suppliedName?: string) {
  if (code === 'CH') return ''
  if (suppliedName) return suppliedName.toLocaleUpperCase(locale)
  if (!code) return ''
  // Some ICU builds do not ship Romansh display names. Keep the ISO code in that case.
  const names = Intl.DisplayNames.supportedLocalesOf(locale, { localeMatcher: 'lookup' })
  return (names.length ? new Intl.DisplayNames(names, { type: 'region' }).of(code) ?? code : code).toLocaleUpperCase(locale)
}

/** Address lines for mail sent from Switzerland. Data values keep their supplied spelling. */
export function addressLines(address: SwissQrAddress | EchMailAddress, locale: SwissMessageLocale = defaultSwissLocale): string[] {
  if ('name' in address) return [
    address.name, line(address.street, address.buildingNumber), line(address.postalCode, address.town),
    countryLine(address.country.toUpperCase(), locale),
  ].filter(Boolean)

  const { organisation, person, addressInformation: info } = address
  const contact = person ?? organisation
  const number = (info.houseNumber ?? '') + (info.dwellingNumber ? '/' + info.dwellingNumber : '')
  const postalCode = info.swissZipCode ?? info.foreignZipCode
  const domestic = info.country.countryId === 8100 || info.country.countryIdISO2 === 'CH' ||
    (!info.country.countryIdISO2 && info.swissZipCode !== undefined && /^(?:Switzerland|Schweiz|Suisse|Svizzera|Svizra)$/i.test(info.country.countryNameShort))
  return [
    organisation?.organisationName, organisation?.organisationNameAddOn1, organisation?.organisationNameAddOn2,
    line(contact.title, contact.firstName, contact.lastName),
    info.addressLine1, info.addressLine2, line(info.street, number), info.locality === info.town ? '' : info.locality,
    line(info.postOfficeBoxText, info.postOfficeBoxNumber), line(postalCode, info.town),
    domestic ? '' : countryLine(info.country.countryIdISO2, locale, info.country.countryNameShort),
  ].filter((part): part is string => Boolean(part?.trim()))
}
