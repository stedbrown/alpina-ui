# Swiss interfaces

Alpina ships nine React components and pure functions for Swiss data. Set the locale explicitly or use the default, `it-CH`. The other supported locales are `de-CH`, `fr-CH`, and `rm-CH`.

| Component | Main props | HTML or output |
| --- | --- | --- |
| `CurrencyCHF` | `amount: number \| bigint`, `locale?` | `data` with a machine-readable numeric value |
| `SwissDate` | `value: string \| Date`, `locale?`, `dateStyle?`, `timeZone?` | `time` with a `datetime` attribute |
| `LocaleSelect` | `value?`, `defaultValue?`, `onLocaleChange?(locale)` | `select` with each of the four languages named in its own language |
| `CantonSelect` | `locale?`, `value?`, `defaultValue?`, `placeholder?`, `onCantonChange?(code)` | `select` with 26 localized canton names and their abbreviations |
| `CantonCombobox` | `locale?`, `value?`, `defaultValue?`, `onCantonChange?(code)`, `name?`, `required?` | Labeled search field and list of cantons |
| `SwissPostalCodeInput` | `value?` and `defaultValue?` as strings, `required?`, `onChange?` | Text input with a numeric keypad |
| `SwissAddressForm` | `onSave`, `initialValue?`, `locale?`, `labels?`, `className?` | Postal address form with five required fields |
| `Calendar` | `value?`, `defaultValue?`, `onValueChange?`, `defaultMonth?`, `min?`, `max?` | Monthly grid of civil dates |
| `DatePicker` | `label`, `name?`, `value?`, `defaultValue?`, `onValueChange?` | Picker that returns an ISO civil date |

The native locale select, canton select, and postal code field forward `ref`, `id`, `name`, `disabled`, `required`, ARIA attributes, and native events. Give each a visible label. For a controlled select, supply `value` and the typed callback. With `defaultValue`, the browser manages the selection.

## Collect a postal address

```tsx
import { SwissAddressForm, type SwissAddress } from 'alpina-ui/swiss/swiss-address-form'

export function PostalAddress({ save }: { save: (value: SwissAddress) => Promise<void> }) {
  return <SwissAddressForm locale="it-CH" initialValue={{ canton: 'TI' }} onSave={save} />
}
```

`onSave(address)` receives `recipient`, `street`, `postalCode`, `locality`, and `canton` with leading and trailing whitespace removed. The first four values are strings. The canton abbreviation has type `CantonCode`. All five fields are required. The form checks the four-digit postal code and verifies that the canton belongs to the list. If validation fails, focus moves to the first field that needs attention.

When several fields need correction, the error summary lists them in form order. Each link focuses its control and preserves the current URL. The field description explains the problem. The summary updates as you type and disappears once only one error remains, with the message still visible at the field.

The callback can return nothing or return a promise. While saving, the form suspends editing and resubmission. If the callback throws or its promise rejects, the form displays a general error, preserves the values, and enables the button for another attempt. Your application chooses where to save the address. The form passes the five fields to `onSave` and keeps them in the DOM during correction.

### Connect validation errors from a service

If your application detects errors on individual fields, return `{ fieldErrors }` from `onSave`, synchronously or asynchronously. Keys are `SwissAddress` field names. Values are messages in the current interface language. The form preserves the entered text and shows each message beside its field. Editing a field clears its own service error. Other errors stay visible. If someone moves focus outside the form while waiting, the response preserves their new focus position.

```tsx
import { SwissAddressForm, type SwissAddress, type SwissAddressValidationResult } from 'alpina-ui'

type AddressService = {
  save: (address: SwissAddress) => Promise<void | SwissAddressValidationResult>
}

export function ShippingForm({ save }: AddressService) {
  return <SwissAddressForm locale="it-CH" onSave={save} />
}
```

A delivery service could return `{ fieldErrors: { postalCode: 'Delivery is currently unavailable for this postal code.' } }`, translated into the language of its form. Your application supplies this text. The form itself performs the local format checks described above.

`initialValue?: Partial<SwissAddress>` is read on first mount. To open another address, give the form a new React `key`. Changing `locale` updates the built-in labels and errors while preserving entered values. Customize any text through `labels?: Partial<SwissAddressLabels>`, for example `labels={{ submit: 'Confirm address' }}`. The `swissAddressLabels` map exposes the strings for all four languages. Romansh field terminology follows the forms used by the Canton of Graubünden. [Cantonal form in Romansh](https://www.gr.ch/RM/instituziuns/administraziun/diem/hba/vender-dar-en-locaziun/tagungsraeume/Seiten/Reservationsanfrage.aspx)

## Compose individual fields

```tsx
import { CantonSelect, SwissPostalCodeInput } from "alpina-ui"

export function Address() {
  return (
    <fieldset>
      <legend>Postal address</legend>
      <label htmlFor="canton">Canton</label>
      <CantonSelect id="canton" name="canton" locale="it-CH" defaultValue="TI" />
      <label htmlFor="postal-code">Postal code</label>
      <SwissPostalCodeInput id="postal-code" name="postalCode" required />
    </fieldset>
  )
}
```

`CantonSelect` always submits the abbreviation, such as `TI`, even after a language change. To require an explicit choice, use `placeholder="Choose a canton"` and `required`. The `cantons` dataset contains the German, French, Italian, and Romansh names in federal statistical order. Each entry exposes `code` and `names[locale]`. [Statistical Atlas of Switzerland](https://datavis.bfs.admin.ch/statatlas/maps/md-13.40/core/projects/13.40/xshared/pdf/134_131.pdf) · [Federal Constitution](https://www.fedlex.admin.ch/eli/cc/1999/404/it) · [Federal Chancellery, map of cantons in Romansh](https://www.bk.admin.ch/dam/bk/de/dokumente/komm-ue/Buku2025/BUKU_2025_RM.pdf.download.pdf/BUKU_2025_RM.pdf)

`SwissPostalCodeInput` uses native HTML validation for the four-digit format, including on submission. `isSwissPostalCode(value)` performs the same check on a string. To check that a postal code exists and matches a locality, consult the postal directory. [Official directory of towns and cities](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

## Search for a canton in four languages

```tsx
import { CantonCombobox } from 'alpina-ui/swiss/canton-combobox'

export function CantonOfResidence() {
  return <CantonCombobox name="canton" label="Canton of residence" locale="it-CH" required />
}
```

`CantonCombobox` searches abbreviations and canton names in German, French, Italian, and Romansh. For example, typing “Graubunden” in an Italian interface returns “Grigioni” with the abbreviation GR. Search ignores accents, case, and hyphens. The selected locale sets the default labels and display names. Customize `label`, `description`, `error`, `placeholder`, `noResults`, `clearLabel`, and `requiredMessage` as needed.

Arrow keys move through the list, Enter confirms the highlighted option, and clicking selects a canton directly. Escape, Tab, and moving focus away close the results and restore the confirmed value. The clear button returns an empty string. DOM focus stays in the input. The list identifies the highlighted option with `aria-activedescendant`. [WAI-ARIA combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

For controlled state, supply `value` and `onCantonChange`. Use `defaultValue` for internal state. The value is always `CantonCode | ''`. When you set `name`, `FormData` receives the confirmed abbreviation. `required` uses native validation on the visible field. `disabled` excludes the value from submission. A native form reset restores the initial value in uncontrolled mode.

## Currency and dates

```ts
import { formatCHF } from "alpina-ui/swiss/format-chf"
import { formatSwissDate } from "alpina-ui/swiss/format-swiss-date"

formatCHF(1250.50, "fr-CH")
formatSwissDate("2026-11-24", "rm-CH", { dateStyle: "long" })
formatSwissDate(new Date("2026-03-29T22:30:00Z"), "it-CH")  // March 30 in Zurich
```

`formatCHF(amount, locale?)` accepts a finite amount in francs and displays two decimals with the code CHF. Spacing, separators, and the position of CHF follow the locale. Displayed amounts round to the nearest centime. Use `bigint` for whole-franc amounts beyond the integer precision of `number`.

`formatSwissDate(value, locale?, options?)` accepts Gregorian civil dates in exact `YYYY-MM-DD` format (years 0001–9999) and `Date` objects. A civil date retains its day in every time zone. A `Date` represents an instant and defaults to `Europe/Zurich`, including seasonal clock changes. For instants, pass another IANA zone in `timeZone`. `dateStyle` accepts `short`, `medium` (default), `long`, and `full`. Invalid dates and infinite amounts produce a `RangeError`.

The browser and server formatters use `Intl` and are reused. For German, French, and Italian, the library requests the chosen language first, followed by the available Swiss alternatives. Language data versions in different runtimes can affect punctuation. Canton and language names come from the bundled dataset. [ECMAScript Internationalization API](https://tc39.es/ecma402/2026/#locale-and-parameter-negotiation)

When a runtime lacks Romansh data, Alpina uses Unicode CLDR 48 patterns for CHF and Gregorian dates in Romansh. For example, `2026-04-05` in `full` format reads *dumengia, ils 5 d’avrigl 2026*. The fallback still uses `Intl` for number rounding and to obtain the day, month, and year in the requested time zone. Importing only the CHF formatter leaves month and weekday names out of your bundle. These data ship under the Unicode-3.0 license in `UNICODE-LICENSE.txt`. [CLDR 48 Romansh data](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Unicode license](https://github.com/unicode-org/cldr/blob/release-48/LICENSE)

## Limit a selector to two languages

`<LocaleSelect locales={['it-CH', 'de-CH']} value={language} onLocaleChange={setLanguage} />` displays the two language names in their own languages and in the requested order. For a controlled field, keep `value` set to an offered locale. The same state can drive Alpina components and application strings. In a bilingual table, use `Intl.Collator(language)` in the comparator for columns sorted by name.

## Filter across all cantons

Use `CantonSelect allLabel="All cantons"` to let users return to the initial choice after selecting one canton. For a German page, pass a label such as “Alle Kantone.” Read `event.currentTarget.value` in `onChange` for the abbreviation or the empty string. `onCantonChange` still reports only canton codes. `allLabel` takes precedence over `placeholder`. When you omit `allLabel`, the ordinary form placeholder retains its behavior.
## Bank accounts, insurance numbers and telephone numbers

Use `IbanInput` for 21-character CH and LI accounts. `isSwissIban` checks the country, account structure and modulo-97 check digits. `compactIban` prepares a validated value for storage. A valid checksum establishes the structure of the identifier. Account ownership requires a separate verification process. [SIX IBAN guidance](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html)

`AhvInput` validates the 756 prefix and EAN-13 check digit, then groups the 13 digits for reading. `PhoneInput` accepts a nine-digit national number, its domestic trunk prefix or the international +41 or 0041 prefix. Both format valid entries on blur. Invalid drafts stay visible for correction. Use `validationMessage` for translated native form errors and the exported validation helpers when processing submissions. [Central Compensation Office](https://www.zas.admin.ch/de/ahv-nummer-identifikator) · [OFCOM telephone numbering](https://www.bakom.admin.ch/de/telefonnummern)

`SwissQrBill` renders a payment part and receipt. The QR-bill guide describes reference types, structured addresses and printing. [Swiss QR-bill guide](https://alpina-ui.vercel.app/docs/guides/qr-bill/)
