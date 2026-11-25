# Swiss interfaces

Alpina ships React components and pure functions for Swiss data. Set a locale on a component or its enclosing provider. Swiss interfaces support `it-CH`, `de-CH`, `fr-CH` and `rm-CH`.

| Component | Main props | HTML or output |
| --- | --- | --- |
| `CurrencyCHF` | `amount: number \| bigint`, `locale?` | `data` with a machine-readable numeric value |
| `SwissDate` | `value: string \| Date`, `locale?`, `dateStyle?`, `timeZone?` | `time` with a `datetime` attribute |
| `LocaleSelect` | `value?`, `defaultValue?`, `onLocaleChange?(locale)` | `select` with each of the four languages named in its own language |
| `CantonSelect` | `locale?`, `value?`, `defaultValue?`, `placeholder?`, `onCantonChange?(code)` | `select` with 26 localized canton names and their abbreviations |
| `CantonCombobox` | `locale?`, `value?`, `defaultValue?`, `onCantonChange?(code)`, `name?`, `required?` | Labeled search field and list of cantons |
| `SwissPostalCodeInput` | `value?` and `defaultValue?` as strings, `required?`, `onChange?` | Text input with a numeric keypad |
| `SwissAddressForm` | `onSave`, `initialValue?`, `locale?`, `labels?`, `className?` | Postal address form with five required fields |
| `UidInput` | `value?`, `defaultValue?`, `validationMessage?` | Swiss business identifier with modulo-11 validation |
| `Calendar` | `value?`, `defaultValue?`, `onValueChange?`, `defaultMonth?`, `min?`, `max?` | Monthly grid of civil dates |
| `DatePicker` | `label`, `name?`, `value?`, `defaultValue?`, `onValueChange?` | Picker that returns an ISO civil date |

The native locale select, canton select, and postal code field forward `ref`, `id`, `name`, `disabled`, `required`, ARIA attributes, and native events. Give each a visible label. For a controlled select, supply `value` and the typed callback. With `defaultValue`, the browser manages the selection.

## Rumantsch grischun

Use `rm-CH` for the standardized written language used in federal publications. The language menu names it *Rumantsch*. A reader can select it for addresses, cantons, dates, holidays, amounts and QR payment slips. The four translation fields keep the names `title[de]`, `title[fr]`, `title[it]` and `title[rm]` on submission. Set `<MultilingualField locale="rm-CH" … />` to give the editor Romansh completion states, character counts and copy actions. The interface language and the language being edited can differ. [Lia Rumantscha on Rumantsch grischun](https://www.liarumantscha.ch/de/raetoromanisch/rumantsch-grischun) · [Federal Chancellery language resources and Pledari Grond](https://www.bk.admin.ch/rm/rumantsch)

Pass `locale="rm-CH"` to `IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` and `SwissPostalCodeInput` for native validation messages. A language change preserves the value and updates the correction. `validationMessage` overrides the message for an invalid value. On the server, `swissValidationMessage('postalCode', 'rm-CH')` returns the same wording. [Address form example](https://alpinaui.com/docs/components/swiss-address-form/)

| Example | Romansh display |
| --- | --- |
| Quantity | 1 234,50 |
| Negative amount | CHF −1 234,50 |
| Full date | venderdi, ils 19 da favrer 2027 |

```ts
const locale = 'rm-CH'
formatSwissNumber('1234.50', locale, { minimumFractionDigits: 2 })
formatCHF(-1234.5, locale)
formatSwissDate('2027-02-19', locale, { dateStyle: 'full' })
```

The JavaScript engine decides which ICU locales it includes. A valid BCP 47 tag may silently resolve to another language. Check `Intl.NumberFormat.supportedLocalesOf(['rm-CH'], { localeMatcher: 'lookup' })` and `Intl.DateTimeFormat.supportedLocalesOf(…)` separately. Alpina supplies CLDR 48 Romansh date forms, month and weekday names and numeric separators for its formatters. The runtime still provides time-zone conversion and currency rounding. Generic application calls to `Intl.DisplayNames`, relative time, or number spell-out need their own locale data where required. [Unicode CLDR 48, Romansh](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [ECMA‑402 locale matching](https://tc39.es/ecma402/#sec-supportedlocales)

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

### Postal locality suggestions

Use `SwissAddressFields` inside an existing form. It renders a fieldset with native controls, field names and locality suggestions. Postcode, locality and canton share a row when space permits. Their labelled hints and errors appear underneath the group. Each control announces its own feedback. `value` and `onValueChange` support controlled forms. Use `defaultValue` with native FormData for an uncontrolled form.

```tsx
import { SwissAddressFields } from 'alpina-ui/swiss/swiss-address-form'

export function DeliveryFields() {
  return <SwissAddressFields locale="fr-CH" fields={['street', 'postalCode', 'locality', 'canton']}
    names={{ locality: 'town' }} />
}
```

After four digits, `SwissAddressForm` offers the official locality and canton together. For example, 6900 offers Lugano, Massagno and Paradiso. For 1085 the locality Vulliens occurs in both FR and VD. Selecting an option fills the two fields. People can keep an existing address or enter either field manually, including administrative postcodes outside the residential directory.

`await lookupSwissPostalCode('6900')` returns an array of `{ locality, canton }` pairs. An unknown or incomplete postcode returns an empty array. The first valid lookup imports the packaged dataset, so a code-splitting bundler can fetch it on demand. The hosted portal loads it from the same origin. No address is sent to a third party. The downloadable catalog includes the data for offline use.

The 1 November 2026 edition contains 3,177 Swiss residential postcodes and 4,233 distinct locality/canton pairs. Alpina uses postal locality names, removes repeated municipality rows and preserves cantons across boundaries. Liechtenstein records are outside the Swiss canton selector. The publisher updates this directory monthly. [Official directory of towns and cities](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

**Source ©swisstopo.** The federal OGD terms allow adaptation, redistribution and commercial use with attribution. Include the source credit when displaying or redistributing suggestions in a custom interface. [swisstopo terms of use](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices)

From the repository root, run `python3 scripts/generate-postal-localities.py` to rebuild the directory offline using the Python standard library. The script checks the archived ZIP's SHA‑256 and produces deterministic UTF-8 output. To update the snapshot, download the new LV95 CSV archive, record its publisher date and hash, then regenerate and review the locality changes. [Official CSV download](https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_2056.csv.zip) · [Publisher’s STAC record](https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo-vd.ortschaftenverzeichnis_plz/items/ortschaftenverzeichnis_plz)

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

### Exchange a Swiss street address with eCH-0010

Select `format="ech-person"` or `format="ech-organisation"` for eCH-0010 8.1.0 street delivery. The public example uses the organisation form. These modes keep the street and building number separate, accept two optional address lines, and require a Swiss postal code in the inclusive range 1000–9999. The compact five-field form remains available for applications that store a single street line. Postal directory matching is an application concern. [eCH-0010 8.1.0 and supplementary XML schemas](https://www.ech.ch/de/ech/ech-0010/8.1.0)

| Address field | Maximum Unicode characters |
| --- | ---: |
| Given or family name | 30 each |
| Organisation name | 60 |
| Supplementary lines 1 and 2 | 150 each |
| Street | 150 |
| Building number | 30 |
| Town | 40 |

For a person, `recipient` is the family name and `firstName` is optional. For an organisation, `recipient` holds the organisation name. Line 1 can identify a care-of recipient and line 2 a building. `locality` in Alpina maps to the schema’s `town`. The form retains the canton for application use. The exchange object includes the Swiss country code and country name. Additional exchange profiles, such as a post-office box or a foreign address, have different fields.

```tsx
<SwissAddressForm format="ech-organisation" locale="de-CH" onSave={address => {
  const payload = toEchMailAddress(address, 'ech-organisation')
  return savePostalRecord(payload)
}} />
```

`UidInput` accepts the CHE prefix and nine digits in grouped or compact form. The final digit follows the modulo-11 check in eCH-0108. A check digit of 10 is unassignable. An exact multiple of 11 yields 0. For example, `CHE109322551` displays as `CHE-109.322.551`. Verifying assignment to an enterprise requires a UID register lookup. [eCH-0108 v6.0.0](https://www.ech.ch/de/ech/ech-0108/6.0.0) · [Federal Statistical Office UID register](https://www.bfs.admin.ch/de/unternehmensidentifikation-uid)

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

`formatCHF(amount, locale?)` accepts a finite amount in francs and displays two decimals with the code CHF. German and Italian group thousands with a right single quotation mark (U+2019). French uses a narrow no-break space (U+202F). The currency code follows the locale’s placement. Use `bigint` for whole-franc amounts beyond the integer precision of `number`.

By default, amounts round to the nearest centime. Set `cashRounding` on `CurrencyCHF`, or pass `{ cashRounding: true }` as the third argument to `formatCHF`, to round a cash total to the nearest five centimes. Exact half steps round away from zero. Apply this once to the payable total. The HTML data value preserves the original amount. [Unicode currency rounding data](https://github.com/unicode-org/cldr/blob/release-48/common/supplemental/supplementalData.xml)

`formatSwissDate(value, locale?, options?)` accepts Gregorian civil dates in exact `YYYY-MM-DD` format (years 0001–9999) and `Date` objects. A civil date retains its day in every time zone. A `Date` represents an instant and defaults to `Europe/Zurich`, including seasonal clock changes. For instants, pass another IANA zone in `timeZone`. `dateStyle` accepts `short` (default, DD.MM.YYYY), `medium`, `long`, and `full`. Use `formatSwissTime(instant, timeZone?)` for a 24-hour clock. Midnight reads 00:00. Invalid dates and infinite amounts produce a `RangeError`.

The Calendar starts on Monday. Pass `showWeekNumbers` to display the ISO week beside each row. The default seven-column layout and the DatePicker dialog fit 180 CSS pixels. Narrow calendars shorten the visible weekday headings while retaining full names for assistive technology. Day numbers and booking marks have separate gutters, including when the week-number column is visible. `isoWeek(day)` returns the week number and ISO week year, which can differ from the civil year in late December and early January.

For bookings, pass `dayStatus(date)` to mark a date as `available`, `full` or `closed`. The callbacks receive ISO civil dates. Weekends have a distinct background. The day button announces its localized status and uses a solid, dotted or dashed rule for available, full or closed dates. Arrow keys still visit unavailable dates so their status can be read. Selecting one leaves the current value unchanged. `isDateDisabled(date)` and `disableHolidays` mark a day closed even when the availability callback reports spaces. `disableHolidays` applies to the configured canton, region and observance, including listed half-day holidays.

```tsx
<DatePicker locale="fr-CH" canton="VD" disableHolidays name="appointment"
  isDateDisabled={date => clinicClosures.has(date)}
  dayStatus={date => capacity.get(date) === 0 ? 'full' : 'available'} />
```

## Schedule work around public holidays

`swissHolidays(year, canton, options?)` returns dates in chronological order. It uses the public rest-day rules for all 26 cantons reviewed in November 2026. The rules project onto the requested Gregorian year. Historical legislation, payroll entitlements, school breaks and individual employers’ closing dates require their own calendars. Only 1 August has federal holiday status. Easter Sunday, Whit Sunday and the Federal Day of Thanksgiving appear as named Sundays, with Geneva’s local fast in September. [SECO overview and regional schedules](https://www.seco.admin.ch/dam/de/sd-web/x5LtHPJdNis5/Anhang-Feiertage-Schweiz-Auszug-ArG-ArGV1-5-SECO-SB-2024-DE.pdf) · [Federal Department of Foreign Affairs on the September observances](https://www.aboutswitzerland.eda.admin.ch/en/summer-festivals-and-customs)

```tsx
import { Calendar, DatePicker, addBusinessDays, swissHolidays } from 'alpina-ui'

const holidays = swissHolidays(2026, 'FR', { region: 'FR-reformed', locale: 'fr-CH' })
const collection = addBusinessDays('2026-04-02', 1, 'FR', { region: 'FR-reformed' })
// collection is '2026-04-07', after Good Friday, the weekend and Easter Monday.

export function CollectionForm() {
  return <form>
    <Calendar canton="FR" holidayRegion="FR-reformed" locale="fr-CH" />
    <DatePicker canton="FR" holidayRegion="FR-reformed" locale="fr-CH" name="collection" defaultValue={collection} />
  </form>
}
```

Each entry has a stable `id`, ISO civil `date`, localized `name`, `scope` and `duration`. The calendar marks each date, announces the holiday with the day and displays names below the month. Holidays remain selectable. Different holidays can share one date.

`addBusinessDays(start, amount, canton, options?)` counts Monday through Friday beginning on the day after the start. Negative amounts count backwards from the previous day. Zero preserves the start. Whole-day holidays are skipped. Solothurn’s 1 May afternoon still counts as a working day. Geneva’s special Sunday substitution for employers outside the federal Labour Act falls outside this standard business calendar. [Solothurn labour inspectorate](https://so.ch/verwaltung/volkswirtschaftsdepartement/amt-fuer-wirtschaft-und-arbeit/arbeitsbedingungen/arbeitsinspektorat/feiertage) · [Geneva holiday law, article 1](https://silgeneve.ch/legis/data/rsg_j1_45.htm)

### Choose statutory or common observance

| Option | What the schedule contains | Example in Aargau |
| --- | --- | --- |
| `observance: 'statutory'` (default) | Canton-wide statutory dates, named Sundays and the selected region’s statutory dates. | Easter Monday appears for the Aarau profile. The Bremgarten profile leaves it open. |
| `observance: 'common'` | The same schedule plus recurring, documented full-day closures used for office planning. Additions have `scope: 'customary'`. | Easter Monday, Whit Monday and St Stephen’s Day appear across the canton. A region’s statutory classification takes precedence. |

Use the same option on `Calendar`, `DatePicker` and `addBusinessDays`. Common observance describes a planning convention. For a particular employer, the applicable contract and work calendar determine the actual day off. Regional festivals, discretionary bridge days, half-day concessions and employer-specific replacement days are outside the customary overlay.

| Territory | Documented full-day additions when absent from the statutory profile |
| --- | --- |
| AG, FR | 2 January, Easter Monday, Whit Monday and 26 December. The Aargau administration publishes its working calendar. Fribourg identifies these four as its most common closure days. [Aargau work calendar](https://www.ag.ch/media/kanton-aargau/portal/jobs-karriere/anstellungsbedingungen-dokumente/sollarbeits-und-betriebszeit-2026.pdf) · [Fribourg labour authority](https://www.fr.ch/travail-et-entreprises/employes/jours-feries) |
| LU, NW, OW, SO, ZG | The same four dates appear in cantonal working schedules or administrative rules. [Lucerne](https://personal.lu.ch/-/media/Personal/Dokumente/down_load/offentliche_dokumente/Anstellungsbedingungen_fuer_das_Staatspersonal.pdf) · [Nidwalden, Art. 28](https://gesetze.nw.ch/app/de/texts_of_law/171.1) · [Obwalden](https://www.ow.ch/_docn/6325/Feiertage.pdf) · [Solothurn](https://so.ch/fileadmin/internet/fd/fd-pa/Personalamt/03_Anstellungsbedingungen-GAV/20_Arbeitszeit/Sollarbeitszeit_2026_ohne_Vorholzeit.pdf) · [Zug, § 13](https://bgs.zg.ch/api/de/versions/62/pdf_file) |
| NE | Easter Monday, Whit Monday and the Monday following the Federal Fast. The canton lists these as retail closing days, subject to exceptions. [Neuchâtel](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) |
| VS | Good Friday, Easter Monday, Whit Monday and 26 December, drawn from the state personnel calendar. [Valais personnel law](https://lex.vs.ch/data/172.4/fr) |
| ZH | 2 January (Berchtoldstag), observed by the cantonal administration. [Zürich personnel office](https://www.zh.ch/de/arbeiten-beim-kanton/fuer-hr-profis/handbuch-personalrecht/definition/arbeitszeit/grundlagen-zur-arbeitszeit.html) |
| Remaining cantons | Both modes use the same documented statutory schedule. |

### Choose the workplace region

With just a canton code, the result includes dates shared throughout that canton. Select a profile for these official local schedules. A profile for another canton raises a `RangeError`.

| Profile | Territory |
| --- | --- |
| `AG-aarau` | Aarau, Brugg, Kulm, Lenzburg, Zofingen and the municipality of Bergdietikon |
| `AG-baden` | Baden district outside Bergdietikon |
| `AG-bremgarten` | Bremgarten district |
| `AG-laufenburg` | Laufenburg and Muri districts, plus Hellikon, Mumpf, Obermumpf, Schupfart, Stein and Wegenstetten |
| `AG-rheinfelden` | Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen and Zuzgen |
| `AG-zurzach` | Zurzach district |
| `FR-catholic`, `FR-reformed` | The workplace’s statutory area as listed by the canton, independent of personal religion |
| `SO-outside-bucheggberg` | Solothurn outside Bucheggberg. Bucheggberg uses the canton-only result |
| `NE-le-landeron` | Le Landeron adds Corpus Christi |
| `AI-inner` | Innerrhoden’s inner territory adds Saint Maurice |
| `OW-engelberg` | Engelberg adds Saint Benedict |

The geographic definitions come from the [Aargau employment law, §6](https://gesetzessammlungen.ag.ch/app/de/texts_of_law/961.200), [Fribourg employment service](https://www.fr.ch/travail-et-entreprises/employes/jours-feries), [Neuchâtel’s implementing order](https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf), [Appenzell Innerrhoden](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/) and [Obwalden](https://www.ow.ch/_docn/6325/Feiertage.pdf).

### Check the scope of a holiday

Ticino and Jura designate additional official rest days, including 29 June and 23 June respectively. A holiday can be a cantonal rest day even where federal working-time law treats it as a weekday. Knabenschiessen is an employer-dependent local closure in Zürich. [Ticino calendar](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1) · [Jura holiday law](https://rsju.jura.ch/fr/viewdocument.html?Download=1&id=38948&idn=9554&v=2) · [Zürich labour authority](https://www.zh.ch/de/wirtschaft-arbeit/arbeitsbedingungen/arbeitsssicherheit-gesundheitsschutz/arbeits-ruhezeiten/feiertage.html)

Glarus moves the Näfelser Fahrt forward a week when it would fall on Maundy Thursday. Neuchâtel marks 2 January and 26 December only when they fall on a Monday. Vaud’s fast falls on the Monday after the third Sunday in September. [Glarus](https://www.gl.ch/portrait/naefelser-fahrt.html/207) · [Neuchâtel](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) · [Vaud](https://www.vd.ch/formation/jours-feries-et-vacances-scolaires/jours-feries-et-vacances-scolaires-2026)

Cantonal rest-day schedules also cover differences between neighbouring cantons. [Lucerne](https://srl.lu.ch/app/de/texts_of_law/855) · [Uri](https://www.ur.ch/_docn/404812/%C3%9Cbersicht_Feiertage_Kanton_Uri_gem._ArG_und_LSG.pdf) · [Schwyz](https://www.sz.ch/public/upload/assets/71606/Kantonale_lokale_und_nationale_Feiertage.pdf) · [Nidwalden](https://gesetze.nw.ch/app/de/texts_of_law/921.1) · [Zug](https://zg.ch/de/migration-integration/neu-in-zug/gut-zu-wissen) · [Thurgau](https://www.rechtsbuch.tg.ch/app/de/change_documents/80) · [Graubünden](https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file)

## Date and currency language data

The browser and server formatters use `Intl` and are reused. For German, French, and Italian, the library requests the chosen language first, followed by the available Swiss alternatives. Language data versions in different runtimes can affect punctuation. Canton and language names come from the bundled dataset. [ECMAScript Internationalization API](https://tc39.es/ecma402/2026/#locale-and-parameter-negotiation)

When a runtime lacks Romansh data, Alpina uses Unicode CLDR 48 patterns for CHF and Gregorian dates in Romansh. For example, `2026-04-05` in `full` format reads *dumengia, ils 5 d’avrigl 2026*. The fallback still uses `Intl` for number rounding and to obtain the day, month, and year in the requested time zone. Importing only the CHF formatter leaves month and weekday names out of your bundle. These data ship under the Unicode-3.0 license in `UNICODE-LICENSE.txt`. [CLDR 48 Romansh data](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Unicode license](https://github.com/unicode-org/cldr/blob/release-48/LICENSE)

## Quote Swiss text

Set the language of quoted text on its nearest container, for example `<p lang="fr-CH"><q>Bonjour</q></p>`. The theme supplies double guillemets for the outer quotation and single guillemets for a nested `q`. French includes a narrow no-break space inside each mark. German, Italian and Romansh use unspaced marks. German copy follows Swiss spelling. [Federal Chancellery writing guidelines](https://www.bk.admin.ch/de/schreibweisungen)

## Limit a selector to two languages

`<LocaleSelect locales={['it-CH', 'de-CH']} value={language} onLocaleChange={setLanguage} />` displays the two language names in their own languages and in the requested order. For a controlled field, keep `value` set to an offered locale. The same state can drive Alpina components and application strings. In a bilingual table, use `Intl.Collator(language)` in the comparator for columns sorted by name.

## Filter across all cantons

Use `CantonSelect allLabel="All cantons"` to let users return to the initial choice after selecting one canton. For a German page, pass a label such as “Alle Kantone.” Read `event.currentTarget.value` in `onChange` for the abbreviation or the empty string. `onCantonChange` still reports only canton codes. `allLabel` takes precedence over `placeholder`. When you omit `allLabel`, the ordinary form placeholder retains its behavior.
## Bank accounts, insurance numbers and telephone numbers

`IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` and `SwissPostalCodeInput` accept `onValueChange(value, { normalized, valid })`. The first argument follows the editable text, including any formatting applied on blur. The native `onChange` event still reports typing. For example, typing `0791234567` produces normalized `+41791234567`, and leaving the field reports the displayed `+41 79 123 45 67` with that same normalized value.

`normalized` matches the successful Standard Schema result for each identifier. Empty or invalid inputs produce `null`. `valid` covers the identifier's format, checksum and required checks. An empty optional field is valid.

```tsx
<PhoneInput name="phone" defaultValue="0791234567" onValueChange={(display, details) => {
  setPhoneLabel(display)
  setContactNumber(details.normalized)
}} />
```

Use `IbanInput` for 21-character CH and LI accounts. `isSwissIban` checks the country, account structure and modulo-97 check digits. `compactIban` prepares a validated value for storage. A valid checksum establishes the structure of the identifier. Account ownership requires a separate verification process. [SIX IBAN guidance](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html)

`AhvInput` validates the 756 prefix and EAN‑13 check digit, then groups the 13 digits for reading. `PhoneInput` accepts a nine-digit national number, its domestic trunk prefix or the international +41 or 0041 prefix. Both format valid entries on blur. Invalid drafts stay visible for correction. Use `validationMessage` for translated native form errors and the exported validation helpers when processing submissions. [Central Compensation Office](https://www.zas.admin.ch/de/ahv-nummer-identifikator) · [OFCOM telephone numbering](https://www.bakom.admin.ch/de/telefonnummern)

`SwissQrBill` renders a payment part and receipt. The QR-bill guide describes reference types, structured addresses and printing. [Swiss QR-bill guide](https://alpinaui.com/docs/guides/qr-bill/)

## Editing translations

Use `MultilingualField` to keep all four national languages in one form. A translation counts as complete when it contains more than whitespace. Each editor carries its own language for spelling and pronunciation. The tabs remain mounted so a native form submission includes every translation, including empty ones.

```tsx
<MultilingualField name="title" label="Exhibition title" sourceLanguage="de"
  defaultValue={{ de: 'Die neue Typografie' }} includeEnglish />
```

Read `formData.get('title[fr]')` in a submit handler or server action. Select `layout="columns"` to compare texts or `variant="textarea"` for longer passages. The copy action fills an empty destination. Use `value` and `onValueChange` for controlled forms, and `labels` to translate counts, status and copy actions. Character counts use grapheme clusters when supported by the runtime.

## Printing a business letter

`Letter` prints on A4 and accepts sender and recipient addresses as lines of text, `SwissQrAddress` or `EchMailAddress`. To use the same lines in another document, call `addressLines(address, locale)`. Domestic addresses end with the postcode and town. The helper preserves eCH organisation and contact details, apartment numbers, postal boxes and a supplied foreign country name. For foreign QR addresses it uses the localized country name when available and otherwise retains the ISO code. [Swiss Post addressing examples](https://www.post.ch/en/sending-letters/addressing-and-designing/addressing-consignments-correctly)

Supply a subject, a date and the letter body. Set `windowPosition="left"` or `"right"` to match the envelope. The following measurements are in millimetres from the sheet's top-left corner. They reproduce the public KOMA-Script SN and SNleft reference layouts for the historical Swiss business letter. [KOMA-Script letter profiles, table 4.19](https://mirrors.mit.edu/CTAN/macros/latex/contrib/koma-script/doc/scrguide-en.pdf) · [Swiss Post envelope templates](https://www.post.ch/en/sending-letters/addressing-and-designing/designing-and-packaging-letters)

| Address field | Left | Top | Width | Height |
| --- | --- | --- | --- | --- |
| Left window | 20 | 35.5 | 100 | 45 |
| Right window | 112 | 45 | 90 | 45 |

Fold guides start 3.5 mm from the left edge at 105 and 210 mm from the top. Use `foldMarks={false}` for other envelope folds. Keep the recipient to the address lines that fit the window and proof a sheet in the actual envelope. Continuation pages carry the letter body in the same column.

SWITEC records the withdrawal of SN 010130:2010 on 12 December 2016. The current SN 10130:2026-02 is a separately published edition. The measurements above identify the legacy profiles implemented and tested by Alpina. [Swiss national standardisation work programme](https://www.switec.info/media/2025-08_swiss_national_workprogram.pdf) · [Current business-letter standard](https://www.dinmedia.de/en/standard/sn-10130/400500596)

Open the print dialog from a user action with `printSwissDocument(articleRef.current)`. The helper isolates the mounted document and restores the application after the dialog closes. Print at actual size on A4 with browser headers and footers disabled. [Live letter example](https://alpinaui.com/docs/components/letter/)

### Invoice quantities and CHF amounts

Supply `quantity` and VAT-exclusive `unitPrice` as numbers or period-separated decimal strings with up to four fractional digits. An optional `unit` follows the localized quantity, for example `{ description: 'Proof review', quantity: '2.5', unit: 'h', unitPrice: '80.00', vatRate: 8.1 }`. Use `unit: 'm²'` for a measured area. Unit prices, line amounts and totals show two decimals. When the agreed unit price has additional digits, the underlying line calculation uses the full price and rounds the product once to centimes. The displayed unit price also retains its original decimal input in the HTML `data` value. [Live invoice](https://alpinaui.com/docs/components/invoice-document/)

## Validate on the server

Alpina exposes nine dependency-free Standard Schema validators with localized issues and typed outputs. The shared validation guide includes framework integrations and a working Next.js Server Action. [Swiss validation guide](https://alpinaui.com/docs/guides/validation/)

### Display invoice totals in centimes

Pass `calculateInvoiceTotals(lines).totalCents` directly to `formatCentimes(cents, locale)`. For example, `formatCentimes(8005, 'it-CH')` displays CHF 80.05. The helper accepts safe integer numbers and arbitrary-precision integers (`bigint`). Use `formatCHF` when the source amount is already in francs.
