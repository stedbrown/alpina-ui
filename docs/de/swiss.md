# Schweizer Benutzeroberflächen

Alpina liefert React-Komponenten und reine Funktionen für Schweizer Daten. Lege die Sprache an der Komponente oder am Provider fest. Schweizer Oberflächen unterstützen it-CH, de-CH, fr-CH und rm-CH.

| Komponente | Wichtige Props | HTML oder Ausgabe |
| --- | --- | --- |
| `CurrencyCHF` | `amount: number \| bigint`, `locale?` | `data` mit maschinenlesbarem Zahlenwert |
| `SwissDate` | `value: string \| Date`, `locale?`, `dateStyle?`, `timeZone?` | `time` mit `datetime`-Attribut |
| `LocaleSelect` | `value?`, `defaultValue?`, `onLocaleChange?(locale)` | `select` mit den vier Sprachnamen in der jeweiligen Sprache |
| `CantonSelect` | `locale?`, `value?`, `defaultValue?`, `placeholder?`, `onCantonChange?(code)` | `select` mit den 26 übersetzten Kantonsnamen und Kürzeln |
| `CantonCombobox` | `locale?`, `value?`, `defaultValue?`, `onCantonChange?(code)`, `name?`, `required?` | Beschriftetes Suchfeld und Kantonsliste |
| `SwissLocalityCombobox` | `locale?`, `value?`, `defaultValue?`, `onLocalityChange?(locality)`, `canton?`, `name?`, `required?` | Suchfeld für Postleitzahlen, Orte und Gemeinden |
| `SwissPostalCodeInput` | `value?` und `defaultValue?` als Zeichenketten, `required?`, `onChange?` | Textfeld mit Zifferntastatur |
| `SwissAddressForm` | `onSave`, `initialValue?`, `locale?`, `labels?`, `className?` | Adressformular mit fünf Pflichtfeldern |
| `UidInput` | `value?`, `defaultValue?`, `validationMessage?` | Unternehmensidentifikation mit Modulo-11-Prüfung |
| `Calendar` | `value?`, `defaultValue?`, `onValueChange?`, `defaultMonth?`, `min?`, `max?` | Monatsraster mit Kalenderdaten |
| `DatePicker` | `label`, `name?`, `value?`, `defaultValue?`, `onValueChange?` | Auswahlfeld, das ein ISO-Kalenderdatum zurückgibt |

Die nativen Sprach- und Kantonslisten sowie das PLZ-Feld leiten `ref`, `id`, `name`, `disabled`, `required`, ARIA-Attribute und native Ereignisse weiter. Gib jedem Feld eine sichtbare Beschriftung. Übergib `value` und den typisierten Callback bei kontrollierter Auswahl. Mit `defaultValue` verwaltet der Browser die Auswahl.

## Rumantsch Grischun

`rm-CH` bezeichnet die Standardschriftsprache der Bundesverwaltung. Die Auswahl «Rumantsch» gilt für Adressen, Kantone, Daten, Feiertage, Beträge und QR-Zahlteile. Beim Absenden bleiben die Namen `title[de]`, `title[fr]`, `title[it]` und `title[rm]` erhalten. Mit `<MultilingualField locale="rm-CH" … />` zeigt der Editor Status, Zeichenzahl und Kopieraktionen auf Rätoromanisch, unabhängig von der bearbeiteten Sprache. [Lia Rumantscha](https://www.liarumantscha.ch/de/raetoromanisch/rumantsch-grischun) · [Bundeskanzlei und Pledari Grond](https://www.bk.admin.ch/rm/rumantsch)

Übergib `locale="rm-CH"` an `IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` und `SwissPostalCodeInput` für lokalisierte Validierungsmeldungen. Ein Sprachwechsel erhält den Wert und aktualisiert den Hinweis. `validationMessage` ersetzt den Fehlertext. Serverseitig liefert `swissValidationMessage('postalCode', 'rm-CH')` denselben Wortlaut. [Adressformular](https://alpinaui.com/docs/components/swiss-address-form/)

| Beispiel | Rätoromanische Ausgabe |
| --- | --- |
| Menge | 1 234,50 |
| Negativer Betrag | CHF −1 234,50 |
| Vollständiges Datum | venderdi, ils 19 da favrer 2027 |

```ts
const locale = 'rm-CH'
formatSwissNumber('1234.50', locale, { minimumFractionDigits: 2 })
formatCHF(-1234.5, locale)
formatSwissDate('2027-02-19', locale, { dateStyle: 'full' })
```

Der JavaScript-Motor bestimmt die verfügbaren ICU-Sprachen. Bei einem gültigen Sprachkennzeichen nach BCP 47 kann unbemerkt eine Ersatzsprache greifen. Prüfe `Intl.NumberFormat.supportedLocalesOf(['rm-CH'], { localeMatcher: 'lookup' })` und `Intl.DateTimeFormat.supportedLocalesOf(…)` separat. Alpina enthält rätoromanische Datumsformen, Monats- und Wochentagsnamen sowie Zahlentrennzeichen aus CLDR 48. Die Laufzeit übernimmt Zeitzonen und Rundung. Für `Intl.DisplayNames`, relative Zeiten und ausgeschriebene Zahlen braucht die Anwendung gegebenenfalls eigene Daten. [CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [ECMA‑402-Sprachabgleich](https://tc39.es/ecma402/#sec-supportedlocales)

## Eine Postadresse erfassen

```tsx
import { SwissAddressForm, type SwissAddress } from 'alpina-ui/swiss/swiss-address-form'

export function PostalAddress({ save }: { save: (value: SwissAddress) => Promise<void> }) {
  return <SwissAddressForm locale="it-CH" initialValue={{ canton: 'TI' }} onSave={save} />
}
```

`onSave(address)` erhält `recipient`, `street`, `postalCode`, `locality` und `canton` ohne äussere Leerzeichen. Die ersten vier Werte sind Zeichenketten, der Kanton hat den Typ `CantonCode`. Alle fünf sind Pflichtfelder. Das Formular prüft die vierstellige PLZ und den Kanton und setzt den Fokus auf das erste fehlerhafte Feld.

Mehrere Fehler erscheinen in Feldreihenfolge in der Zusammenfassung. Jeder Link fokussiert das betreffende Feld und erhält die URL. Der Feldhinweis erklärt die Korrektur. Die Zusammenfassung aktualisiert sich beim Tippen und verschwindet beim letzten Fehler, dessen Hinweis am Feld bestehen bleibt.

Der Callback darf nichts oder ein Promise zurückgeben. Während des Speicherns sind Bearbeitung und erneutes Absenden gesperrt. Bei einer Exception oder einem abgelehnten Promise erscheinen ein allgemeiner Fehler und die erneute Sendemöglichkeit; die Werte bleiben erhalten. Die Anwendung bestimmt den Speicherort. Die fünf Felder bleiben zur Korrektur im DOM.

### Postorte vorschlagen

`SwissAddressFields` ergänzt ein vorhandenes Formular durch eine Feldgruppe mit nativen Eingaben, Feldnamen und Ortsvorschlägen. Für kontrollierte Formulare verwende `value` und `onValueChange`, andernfalls `defaultValue` mit FormData.

```tsx
import { SwissAddressFields } from 'alpina-ui/swiss/swiss-address-form'

export function DeliveryFields() {
  return <SwissAddressFields locale="fr-CH" fields={['street', 'postalCode', 'locality', 'canton']}
    names={{ locality: 'town' }} />
}
```

Nach vier Ziffern schlägt `SwissAddressForm` den amtlichen Ort mit Kanton vor. 6900 umfasst Lugano, Massagno und Paradiso; Vulliens (1085) kommt in FR und VD vor. Eine Auswahl füllt beide Felder. Bestehende Adressen und manuelle Eingaben bleiben möglich, auch für Verwaltungs-PLZ ausserhalb des Wohnortverzeichnisses.

`await lookupSwissPostalCode('6900')` liefert Paare aus `{ locality, canton }`, bei unbekannter oder unvollständiger PLZ ein leeres Array. Die erste gültige Suche importiert die Daten bei Bedarf. Das Portal lädt sie von derselben Herkunft, ohne Adressen an Dritte zu senden. Der herunterladbare Katalog enthält sie offline.

### Orte und Gemeinden suchen

`SwissLocalityCombobox` findet einen Ort über PLZ oder Namen und speichert die politische Gemeinde mit der Auswahl. 6900 schlägt Lugano, Massagno und zweimal Paradiso vor, weil Adressen in Paradiso zu zwei Gemeinden gehören. Viganello liefert 6962 Viganello in der Gemeinde Lugano. Die Suche ignoriert Akzente sowie Gross- und Kleinschreibung und akzeptiert Zuerich für Zürich, beide Namen von Biel/Bienne und Sankt für St.

```tsx
import { SwissLocalityCombobox, type SwissLocality } from 'alpina-ui'

export function Residence({ onChange }: { onChange: (place: SwissLocality | null) => void }) {
  return <SwissLocalityCombobox name="residence" locale="it-CH" required onLocalityChange={onChange} />
}
```

Jedes Ergebnis enthält `postalCode`, `locality`, `municipality`, `bfsNumber` und `canton`. Die BFS-Nummer identifiziert die Gemeinde in eidgenössischen und kantonalen Registern. Mit `name="residence"` sendet ein Formular `residence.postalCode`, `residence.locality`, `residence.municipality`, `residence.bfsNumber` und `residence.canton`. `canton` beschränkt die Vorschläge auf einen Kanton. Ohne Komponente liefert `await searchSwissLocalities('lug', { limit: 5 })` dieselben Ergebnisse. Eine Suche kann PLZ und Namen verbinden, etwa `6900 par`.

Die Ausgabe vom 1. November 2026 enthält 3 177 Schweizer Wohnort-PLZ, 4 233 unterschiedliche Ort-Kanton-Paare und 2 112 Gemeinden. Ein Ort, der sich über mehrere Gemeinden erstreckt, erscheint einmal pro Gemeinde, beginnend mit der Gemeinde mit den meisten Adressen. Alpina erhält Kantone an Gebietsgrenzen. Liechtenstein liegt ausserhalb der Kantonsauswahl. Das amtliche Verzeichnis erscheint monatlich. [Amtliches Ortschaftenverzeichnis](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

**Quelle ©swisstopo.** Die OGD-Bedingungen des Bundes erlauben Bearbeitung, Weitergabe und kommerzielle Nutzung mit Quellenangabe. Nenne die Quelle auch in eigenen Oberflächen bei Anzeige oder Weitergabe der Vorschläge. [Nutzungsbedingungen](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices)

Führe `python3 scripts/generate-postal-localities.py` im Projektstamm aus. Das Skript verwendet die Python-Standardbibliothek offline, prüft SHA‑256 des ZIP-Archivs und erzeugt reproduzierbares UTF‑8. Lade für ein Update das neue LV95-CSV-Archiv herunter, notiere Publikationsdatum und Hash und prüfe die Änderungen nach der Generierung. [Amtliche CSV-Datei](https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_2056.csv.zip) · [STAC-Eintrag](https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo-vd.ortschaftenverzeichnis_plz/items/ortschaftenverzeichnis_plz)

### Fehler aus einem Dienst übernehmen

Gib `{ fieldErrors }` aus `onSave` synchron oder asynchron zurück. Als Schlüssel dienen Feldnamen von `SwissAddress`, als Werte Meldungen in der Formularsprache. Werte bleiben erhalten; die Meldung erscheint am betreffenden Feld. Eine Änderung löscht nur dessen Fehler. Hat jemand während des Wartens den Fokus aus dem Formular bewegt, bleibt er dort.

```tsx
import { SwissAddressForm, type SwissAddress, type SwissAddressValidationResult } from 'alpina-ui'

type AddressService = {
  save: (address: SwissAddress) => Promise<void | SwissAddressValidationResult>
}

export function ShippingForm({ save }: AddressService) {
  return <SwissAddressForm locale="it-CH" onSave={save} />
}
```

Ein Lieferdienst kann `{ fieldErrors: { postalCode: 'Für diese PLZ ist die Lieferung derzeit nicht verfügbar.' } }` mit einem von der Anwendung übersetzten Text zurückgeben. Die Formatprüfung erfolgt bereits im Formular.

`initialValue?: Partial<SwissAddress>` wird beim ersten Einhängen gelesen. Für eine andere Adresse ändere den React-`key`. Ein Wechsel von `locale` übersetzt Beschriftungen und Fehler bei unveränderten Werten. Passe Texte über `labels?: Partial<SwissAddressLabels>` an, etwa mit `labels={{ submit: 'Adresse bestätigen' }}`. `swissAddressLabels` enthält alle vier Sprachen; die rätoromanischen Begriffe folgen Bündner Formularen. [Kantonales Formular](https://www.gr.ch/RM/instituziuns/administraziun/diem/hba/vender-dar-en-locaziun/tagungsraeume/Seiten/Reservationsanfrage.aspx)

### Eine Strassenadresse nach eCH-0010 austauschen

Wähle `format="ech-person"` oder `format="ech-organisation"` für Strassenzustellung nach eCH-0010 8.1.0. Das Beispiel nutzt eine Organisation. Strasse und Hausnummer sind getrennt, zwei Zusatzzeilen optional; die Schweizer PLZ liegt zwischen 1000 und 9999. Für eine einzige Strassenzeile gibt es das kompakte Formular mit fünf Feldern. Den Abgleich mit dem Ortsverzeichnis steuert die Anwendung. [Standard und XML-Schemas](https://www.ech.ch/de/ech/ech-0010/8.1.0)

| Adressfeld | Maximale Anzahl Unicode-Zeichen |
| --- | ---: |
| Vor- oder Nachname | Je 30 |
| Name der Organisation | 60 |
| Zusatzzeilen 1 und 2 | Je 150 |
| Strasse | 150 |
| Hausnummer | 30 |
| Ort | 40 |

Bei Personen steht `recipient` für den Familiennamen, `firstName` ist optional. Bei Organisationen enthält `recipient` den Organisationsnamen. Zeile eins kann eine Zustellperson nennen, Zeile zwei ein Gebäude. `locality` entspricht `town` im Schema. Das Formular behält den Kanton; das Austauschobjekt enthält Landescode und Landesname der Schweiz. Postfächer und Auslandsadressen verwenden andere Profile.

```tsx
<SwissAddressForm format="ech-organisation" locale="de-CH" onSave={address => {
  const payload = toEchMailAddress(address, 'ech-organisation')
  return savePostalRecord(payload)
}} />
```

`UidInput` akzeptiert CHE und neun Ziffern, gruppiert oder kompakt. Die letzte folgt der Modulo-11-Prüfung von eCH-0108: 10 ist nicht vergebbar, ein Vielfaches von 11 ergibt 0. `CHE109322551` erscheint als `CHE-109.322.551`. Eine tatsächliche Zuteilung prüfst du im UID-Register. [eCH-0108](https://www.ech.ch/de/ech/ech-0108/6.0.0) · [UID-Register des BFS](https://www.bfs.admin.ch/de/unternehmensidentifikation-uid)

## Einzelne Felder kombinieren

```tsx
import { CantonSelect, SwissPostalCodeInput } from "alpina-ui"

export function Address() {
  return (
    <fieldset>
      <legend>Postadresse</legend>
      <label htmlFor="canton">Kanton</label>
      <CantonSelect id="canton" name="canton" locale="it-CH" defaultValue="TI" />
      <label htmlFor="postal-code">Postleitzahl</label>
      <SwissPostalCodeInput id="postal-code" name="postalCode" required />
    </fieldset>
  )
}
```

`CantonSelect` sendet auch nach dem Sprachwechsel das Kürzel, etwa `TI`. Für eine ausdrückliche Wahl setze `placeholder="Kanton auswählen"` und `required`. `cantons` enthält die vier Sprachfassungen in der Reihenfolge der Bundesstatistik. Jeder Eintrag liefert `code` und `names[locale]`. [Statistischer Atlas](https://datavis.bfs.admin.ch/statatlas/maps/md-13.40/core/projects/13.40/xshared/pdf/134_131.pdf) · [Bundesverfassung](https://www.fedlex.admin.ch/eli/cc/1999/404/it) · [Kantonskarte auf Rätoromanisch](https://www.bk.admin.ch/dam/bk/de/dokumente/komm-ue/Buku2025/BUKU_2025_RM.pdf.download.pdf/BUKU_2025_RM.pdf)

`SwissPostalCodeInput` prüft das vierstellige Format auch beim Absenden. `isSwissPostalCode(value)` prüft eine Zeichenkette nach derselben Regel. Ob eine PLZ existiert und zum Ort passt, zeigt das amtliche Verzeichnis. [Ortschaftenverzeichnis](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

## Einen Kanton in vier Sprachen suchen

```tsx
import { CantonCombobox } from 'alpina-ui/swiss/canton-combobox'

export function CantonOfResidence() {
  return <CantonCombobox name="canton" label="Wohnkanton" locale="it-CH" required />
}
```

`CantonCombobox` durchsucht Kürzel und Namen in Deutsch, Französisch, Italienisch und Rätoromanisch unabhängig von Akzenten, Grossschreibung und Bindestrichen. «Graubunden» findet in einer italienischen Oberfläche «Grigioni», GR. Die Sprache bestimmt Texte und Namen. Anpassbar sind `label`, `description`, `error`, `placeholder`, `noResults`, `clearLabel` und `requiredMessage`.

Pfeiltasten bewegen die Hervorhebung, Enter oder ein Klick bestätigt. Escape, Tab und Fokusverlust schliessen die Liste und stellen die bestätigte Auswahl wieder her. Löschen liefert die leere Zeichenkette. Der Fokus bleibt im Eingabefeld; `aria-activedescendant` kennzeichnet den aktiven Eintrag. [WAI-ARIA-Muster](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

Verwende `value` und `onCantonChange` für kontrollierten Zustand, sonst `defaultValue`. Der Wert hat den Typ `CantonCode | ''`. Mit `name` erhält `FormData` das bestätigte Kürzel. `required` aktiviert native Validierung am sichtbaren Feld, `disabled` schliesst es vom Absenden aus. Ein nativer Reset stellt im unkontrollierten Modus den Ausgangswert wieder her.

## Währung und Datum

```ts
import { formatCHF } from "alpina-ui/swiss/format-chf"
import { formatSwissDate } from "alpina-ui/swiss/format-swiss-date"

formatCHF(1250.50, "fr-CH")
formatSwissDate("2026-11-24", "rm-CH", { dateStyle: "long" })
formatSwissDate(new Date("2026-03-29T22:30:00Z"), "it-CH")  // 30. März in Zürich
```

`formatCHF(amount, locale?)` nimmt einen endlichen Frankenbetrag und zeigt zwei Dezimalstellen mit CHF an der sprachüblichen Position. Deutsch und Italienisch gruppieren mit U+2019, Französisch mit dem schmalen geschützten Leerzeichen U+202F. Nutze `bigint` für ganze Franken ausserhalb der Genauigkeit von `number`.

Voreingestellt ist die Rundung auf Rappen. Für Bargeld setze `cashRounding` an `CurrencyCHF` oder übergib `{ cashRounding: true }` als drittes Argument an `formatCHF`. Exakte Halbwerte werden von null weg gerundet. Runde nur den zahlbaren Gesamtbetrag einmal auf fünf Rappen. Der HTML-Datenwert erhält den Ausgangsbetrag. [Unicode-Währungsdaten](https://github.com/unicode-org/cldr/blob/release-48/common/supplemental/supplementalData.xml)

`formatSwissDate(value, locale?, options?)` akzeptiert gregorianische Daten im Format `YYYY-MM-DD` (Jahre 0001–9999) sowie `Date`. Ein Kalenderdatum behält den Tag in allen Zeitzonen. Ein Zeitpunkt verwendet standardmässig `Europe/Zurich` samt Sommerzeit; eine andere IANA-Zone kann in `timeZone` stehen. Für `dateStyle` gelten `short` (DD.MM.YYYY), `medium`, `long` und `full`. `formatSwissTime(instant, timeZone?)` nutzt 24 Stunden, Mitternacht ist 00:00. Ungültige Daten und unendliche Beträge werfen `RangeError`.

Die Woche beginnt montags. Zwei Menüs über dem Raster springen zu jedem Monat und Jahr. `captionLayout="label"` zeigt den Monat stattdessen als Text. `showWeekNumbers` zeigt ISO-Kalenderwochen. Das Sieben-Spalten-Raster und der Datumsdialog passen in 180 CSS-Pixel. Gekürzte Wochentagsnamen bleiben für Hilfstechnologien ausgeschrieben. `isoWeek(day)` liefert Wochennummer und ISO-Wochenjahr, das um den Jahreswechsel vom Kalenderjahr abweichen kann.

Für Buchungen erhält `dayStatus(date)` ein ISO-Datum und liefert `available`, `full` oder `closed`. Wochenenden haben einen eigenen Hintergrund, Status eine durchgezogene, gepunktete oder gestrichelte Linie und eine lokalisierte Ansage. Pfeiltasten erreichen auch nicht verfügbare Tage; eine Aktivierung lässt den Wert bestehen. `isDateDisabled(date)` und `disableHolidays` übersteuern verfügbare Plätze. Feiertage richten sich nach Kanton, Region und Regel einschliesslich aufgeführter Halbtage.

```tsx
<DatePicker locale="fr-CH" canton="VD" disableHolidays name="appointment"
  isDateDisabled={date => clinicClosures.has(date)}
  dayStatus={date => capacity.get(date) === 0 ? 'full' : 'available'} />
```

## Arbeit rund um Feiertage planen

`swissHolidays(year, canton, options?)` ordnet die Termine chronologisch. Die im November 2026 geprüften Regeln aller 26 Kantone werden auf das gewünschte gregorianische Jahr angewandt. Historisches Recht, Lohnansprüche, Schulferien und betriebliche Schliessungen benötigen eigene Kalender. Nur der 1. August ist eidgenössischer Feiertag. Ostern, Pfingsten und Bettag erscheinen als benannte Sonntage, dazu kommt der Genfer Bettag im September. [SECO](https://www.seco.admin.ch/dam/de/sd-web/x5LtHPJdNis5/Anhang-Feiertage-Schweiz-Auszug-ArG-ArGV1-5-SECO-SB-2024-DE.pdf) · [EDA zu den Bettagen](https://www.aboutswitzerland.eda.admin.ch/en/summer-festivals-and-customs)

```tsx
import { Calendar, DatePicker, addBusinessDays, swissHolidays } from 'alpina-ui'

const holidays = swissHolidays(2026, 'FR', { region: 'FR-reformed', locale: 'fr-CH' })
const collection = addBusinessDays('2026-04-02', 1, 'FR', { region: 'FR-reformed' })
// Die Abholung erfolgt am 7. April 2026 nach Karfreitag, dem Wochenende und Ostermontag.

export function CollectionForm() {
  return <form>
    <Calendar canton="FR" holidayRegion="FR-reformed" locale="fr-CH" />
    <DatePicker canton="FR" holidayRegion="FR-reformed" locale="fr-CH" name="collection" defaultValue={collection} />
  </form>
}
```

Jeder Eintrag enthält eine stabile `id`, ein ISO-`date`, einen lokalisierten `name` sowie `scope` und `duration`. Der Kalender markiert den Tag, kündigt den Feiertag an und nennt ihn unterhalb des Monats. Die Tage bleiben wählbar; mehrere Feiertage können zusammenfallen.

`addBusinessDays(start, amount, canton, options?)` zählt Montag bis Freitag ab dem Folgetag, bei negativen Werten rückwärts ab dem Vortag. Null erhält das Datum. Ganze Feiertage werden ausgelassen, der 1. Mai mit freiem Nachmittag in Solothurn zählt als Arbeitstag. Die Genfer Sonntagsersatzregel für Betriebe ausserhalb des Arbeitsgesetzes gehört nicht zu diesem Kalender. [Arbeitsinspektorat Solothurn](https://so.ch/verwaltung/volkswirtschaftsdepartement/amt-fuer-wirtschaft-und-arbeit/arbeitsbedingungen/arbeitsinspektorat/feiertage) · [Genfer Feiertagsgesetz, Art. 1](https://silgeneve.ch/legis/data/rsg_j1_45.htm)

### Gesetzliche oder übliche Feiertage auswählen

| Option | Inhalt des Kalenders | Beispiel im Aargau |
| --- | --- | --- |
| `observance: 'statutory'` (Vorgabe) | Kantonsweite und regionale gesetzliche Feiertage sowie benannte Sonntage. | Im Profil Aarau ist Ostermontag enthalten, im Profil Bremgarten bleibt er offen. |
| `observance: 'common'` | Ergänzt dokumentierte, regelmässige ganztägige Schliessungen für die Büroplanung mit `scope: 'customary'`. | Ostermontag, Pfingstmontag und Stephanstag gelten kantonsweit. Eine regionale gesetzliche Einstufung geht vor. |

Nutze dieselbe Option bei `Calendar`, `DatePicker` und `addBusinessDays`. Der übliche Kalender dient der Planung; für konkrete freie Tage gelten Vertrag und Betriebsplan. Lokale Feste, freiwillige Brückentage, gewährte Halbtage und betriebliche Ersatztage sind ausgenommen.

| Gebiet | Dokumentierte ganztägige Ergänzungen zum gesetzlichen Profil |
| --- | --- |
| AG, FR | 2. Januar, Ostermontag, Pfingstmontag und 26. Dezember. Aargau veröffentlicht seinen Arbeitskalender; Freiburg bezeichnet diese vier als häufigste Schliessungen. [Arbeitskalender Aargau](https://www.ag.ch/media/kanton-aargau/portal/jobs-karriere/anstellungsbedingungen-dokumente/sollarbeits-und-betriebszeit-2026.pdf) · [Arbeitsbehörde Freiburg](https://www.fr.ch/travail-et-entreprises/employes/jours-feries) |
| LU, NW, OW, SO, ZG | Dieselben vier Tage stehen in Arbeitskalendern oder Verwaltungsvorschriften. [Luzern](https://personal.lu.ch/-/media/Personal/Dokumente/down_load/offentliche_dokumente/Anstellungsbedingungen_fuer_das_Staatspersonal.pdf) · [Nidwalden, Art. 28](https://gesetze.nw.ch/app/de/texts_of_law/171.1) · [Obwalden](https://www.ow.ch/_docn/6325/Feiertage.pdf) · [Solothurn](https://so.ch/fileadmin/internet/fd/fd-pa/Personalamt/03_Anstellungsbedingungen-GAV/20_Arbeitszeit/Sollarbeitszeit_2026_ohne_Vorholzeit.pdf) · [Zug, § 13](https://bgs.zg.ch/api/de/versions/62/pdf_file) |
| NE | Ostermontag, Pfingstmontag und Montag nach dem Bettag gelten mit Ausnahmen als Ladenschlusstage. [Neuenburg](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) |
| VS | Karfreitag, Ostermontag, Pfingstmontag und 26. Dezember gemäss Kalender des Staatspersonals. [Wallis](https://lex.vs.ch/data/172.4/fr) |
| ZH | 2. Januar (Berchtoldstag), arbeitsfrei in der Kantonsverwaltung. [Personalamt Zürich](https://www.zh.ch/de/arbeiten-beim-kanton/fuer-hr-profis/handbuch-personalrecht/definition/arbeitszeit/grundlagen-zur-arbeitszeit.html) |
| Übrige Kantone | Beide Modi folgen demselben dokumentierten gesetzlichen Kalender. |

### Arbeitsregion auswählen

Der Kantonscode allein liefert kantonsweit gemeinsame Daten. Ein Profil ergänzt die aufgeführten amtlichen örtlichen Regeln. Ein Profil eines anderen Kantons löst `RangeError` aus.

| Profil | Gebiet |
| --- | --- |
| `AG-aarau` | Aarau, Brugg, Kulm, Lenzburg, Zofingen und die Gemeinde Bergdietikon |
| `AG-baden` | Bezirk Baden ohne Bergdietikon |
| `AG-bremgarten` | Bezirk Bremgarten |
| `AG-laufenburg` | Bezirke Laufenburg und Muri sowie Hellikon, Mumpf, Obermumpf, Schupfart, Stein und Wegenstetten |
| `AG-rheinfelden` | Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen und Zuzgen |
| `AG-zurzach` | Bezirk Zurzach |
| `FR-catholic`, `FR-reformed` | Vom Kanton festgelegtes gesetzliches Gebiet des Arbeitsorts, unabhängig von der persönlichen Religion |
| `SO-outside-bucheggberg` | Solothurn ausserhalb des Bucheggbergs. Dort gilt der reine Kantonskalender |
| `NE-le-landeron` | Le Landeron ergänzt Fronleichnam |
| `AI-inner` | Der innere Landesteil von Innerrhoden ergänzt Mauritius |
| `OW-engelberg` | Engelberg ergänzt den Benediktstag |

Die Abgrenzung stammt aus dem [Aargauer Arbeitsgesetz, § 6](https://gesetzessammlungen.ag.ch/app/de/texts_of_law/961.200), dem [Amt für den Arbeitsmarkt Freiburg](https://www.fr.ch/travail-et-entreprises/employes/jours-feries), der [Neuenburger Verordnung](https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf) sowie den Angaben von [Innerrhoden](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/) und [Obwalden](https://www.ow.ch/_docn/6325/Feiertage.pdf).

### Geltungsbereich eines Feiertags prüfen

Tessin und Jura kennen zusätzliche amtliche Ruhetage, darunter der 29. Juni im Tessin und der 23. Juni im Jura. Ein kantonaler Ruhetag kann arbeitsgesetzlich ein Werktag sein. Das Zürcher Knabenschiessen hängt vom Arbeitgeber ab. [Tessin](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1) · [Jura](https://rsju.jura.ch/fr/viewdocument.html?Download=1&id=38948&idn=9554&v=2) · [Zürcher Arbeitsbehörde](https://www.zh.ch/de/wirtschaft-arbeit/arbeitsbedingungen/arbeitsssicherheit-gesundheitsschutz/arbeits-ruhezeiten/feiertage.html)

Glarus verschiebt die Näfelser Fahrt um eine Woche, wenn sie auf Gründonnerstag fiele. Neuenburg berücksichtigt den 2. Januar und 26. Dezember nur an einem Montag. Der Waadtländer Bettagsmontag folgt auf den dritten Sonntag im September. [Glarus](https://www.gl.ch/portrait/naefelser-fahrt.html/207) · [Neuenburg](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) · [Waadt](https://www.vd.ch/formation/jours-feries-et-vacances-scolaires/jours-feries-et-vacances-scolaires-2026)

Die kantonalen Ruhetagskalender erläutern auch Unterschiede zwischen Nachbarkantonen. [Luzern](https://srl.lu.ch/app/de/texts_of_law/855) · [Uri](https://www.ur.ch/_docn/404812/%C3%9Cbersicht_Feiertage_Kanton_Uri_gem._ArG_und_LSG.pdf) · [Schwyz](https://www.sz.ch/public/upload/assets/71606/Kantonale_lokale_und_nationale_Feiertage.pdf) · [Nidwalden](https://gesetze.nw.ch/app/de/texts_of_law/921.1) · [Zug](https://zg.ch/de/migration-integration/neu-in-zug/gut-zu-wissen) · [Thurgau](https://www.rechtsbuch.tg.ch/app/de/change_documents/80) · [Graubünden](https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file)

## Sprachdaten für Datum und Währung

Die wiederverwendeten Formatierer in Browser und Server nutzen `Intl`. Für Deutsch, Französisch und Italienisch wird zuerst die gewählte Sprache, dann eine verfügbare Schweizer Alternative angefordert. Datenversionen können die Zeichensetzung beeinflussen. Kantons- und Sprachnamen stammen aus den mitgelieferten Daten. [ECMAScript-API](https://tc39.es/ecma402/2026/#locale-and-parameter-negotiation)

Fehlen rätoromanische Laufzeitdaten, nutzt Alpina CLDR 48 für CHF und gregorianische Daten. `2026-04-05` in `full` ergibt *dumengia, ils 5 d’avrigl 2026*. `Intl` übernimmt weiterhin Rundung und Datumsbestandteile in der Zielzeitzone. Wer nur den CHF-Formatierer importiert, lädt keine Monats- und Tagesnamen. Die Lizenz Unicode-3.0 steht in `UNICODE-LICENSE.txt`. [CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Unicode-Lizenz](https://github.com/unicode-org/cldr/blob/release-48/LICENSE)

## Schweizer Texte zitieren

Lege die Sprache am nächsten umschliessenden Element fest, etwa `<p lang="fr-CH"><q>Bonjour</q></p>`. Das Thema verwendet doppelte Guillemets aussen und einfache für ein verschachteltes `q`. Im Französischen steht innen ein schmales geschütztes Leerzeichen, in den drei anderen Sprachen keines. Deutsche Texte folgen der Schweizer Rechtschreibung. [Schreibweisungen der Bundeskanzlei](https://www.bk.admin.ch/de/schreibweisungen)

## Die Auswahl auf zwei Sprachen beschränken

`<LocaleSelect locales={['it-CH', 'de-CH']} value={language} onLocaleChange={setLanguage} />` zeigt die beiden Eigennamen in der gewünschten Reihenfolge. In einem kontrollierten Feld muss `value` eine angebotene Sprache sein. Derselbe Zustand kann Komponenten und Anwendungstexte steuern. Sortiere Namen in zweisprachigen Tabellen mit `Intl.Collator(language)` im Vergleichsverfahren.

## Über alle Kantone filtern

`CantonSelect allLabel="Alle Kantone"` ermöglicht die Rückkehr zur Gesamtauswahl. Verwende auf Deutsch «Alle Kantone». `event.currentTarget.value` in `onChange` enthält das Kürzel oder eine leere Zeichenkette. `onCantonChange` meldet ausschliesslich Kantonscodes. `allLabel` hat Vorrang vor `placeholder`. Ohne `allLabel` verhält sich der Platzhalter wie bisher.
## Bankkonten, AHV- und Telefonnummern

`IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` und `SwissPostalCodeInput` akzeptieren `onValueChange(value, { normalized, valid })`. Das erste Argument folgt der Eingabe einschliesslich der Formatierung bei Fokusverlust. `onChange` meldet weiterhin die Tastatureingabe. `0791234567` ergibt normalisiert `+41791234567`; beim Verlassen wird `+41 79 123 45 67` mit demselben normalisierten Wert gemeldet.

`normalized` entspricht dem erfolgreichen Standard-Schema-Ergebnis. Leere oder ungültige Eingaben ergeben `null`. `valid` berücksichtigt Format, Prüfziffer und Pflichtfeld. Ein leeres optionales Feld ist gültig.

```tsx
<PhoneInput name="phone" defaultValue="0791234567" onValueChange={(display, details) => {
  setPhoneLabel(display)
  setContactNumber(details.normalized)
}} />
```

Nutze `IbanInput` für 21-stellige CH- und LI-Konten. `isSwissIban` prüft Land, Struktur und Modulo-97-Prüfziffern; `compactIban` bereitet den validierten Wert für die Speicherung vor. Die Prüfziffer bestätigt die Struktur. Die Inhaberschaft erfordert eine gesonderte Prüfung. [SIX zum IBAN](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html)

`AhvInput` prüft das Präfix 756 und die EAN‑13-Prüfziffer und gruppiert die 13 Ziffern. `PhoneInput` akzeptiert neun nationale Ziffern, die nationale Vorwahl oder +41 beziehungsweise 0041. Beide formatieren gültige Werte bei Fokusverlust; fehlerhafte Entwürfe bleiben korrigierbar. Nutze `validationMessage` für übersetzte Fehler und die exportierten Validatoren beim Absenden. [Zentrale Ausgleichsstelle](https://www.zas.admin.ch/de/ahv-nummer-identifikator) · [Nummerierung des BAKOM](https://www.bakom.admin.ch/de/telefonnummern)

`SwissQrBill` stellt Zahlteil und Empfangsschein dar. Der Leitfaden erklärt Referenztypen, strukturierte Adressen und Druck. [QR-Rechnung](https://alpinaui.com/docs/guides/qr-bill/)

## Übersetzungen bearbeiten

`MultilingualField` hält die vier Landessprachen in einem Formular. Eine Übersetzung gilt als vollständig, sobald sie mehr als Leerraum enthält. Jedes Eingabefeld hat eine Sprache für Rechtschreibung und Aussprache. Die Tabs bleiben eingebunden, sodass auch leere Übersetzungen mitgesendet werden.

```tsx
<MultilingualField name="title" label="Ausstellungstitel" sourceLanguage="de"
  defaultValue={{ de: 'Die neue Typografie' }} includeEnglish />
```

Lies `formData.get('title[fr]')` in der Absendeverarbeitung oder einer Server Action. Wähle `layout="columns"` zum Vergleichen, `variant="textarea"` für längere Texte. Kopieren füllt nur ein leeres Ziel. `value` und `onValueChange` steuern das Formular, `labels` übersetzt Zähler, Status und Kopieraktionen. Wo verfügbar, zählt der Editor Graphemcluster.

## Einen Geschäftsbrief drucken

`Letter` druckt auf A4 und nimmt Absender und Empfänger als Textzeilen, `SwissQrAddress` oder `EchMailAddress` an. `addressLines(address, locale)` liefert dieselben Zeilen für andere Dokumente. Inlandadressen enden mit PLZ und Ort. eCH-Organisationen, Kontaktpersonen, Wohnungsnummern, Postfächer und angegebene ausländische Ländernamen bleiben erhalten. Für ausländische QR-Adressen wird der lokalisierte Ländername oder ersatzweise der ISO-Code verwendet. [Beispiele der Post](https://www.post.ch/en/sending-letters/addressing-and-designing/addressing-consignments-correctly)

Gib Betreff, Datum und Brieftext an. Wähle `windowPosition="left"` oder `"right"` passend zum Umschlag. Die folgenden Masse in Millimetern ab der linken oberen Blattecke entsprechen den öffentlichen historischen KOMA-Script-Profilen SN und SNleft. [KOMA-Script, Tabelle 4.19](https://mirrors.mit.edu/CTAN/macros/latex/contrib/koma-script/doc/scrguide-en.pdf) · [Umschlagvorlagen der Post](https://www.post.ch/en/sending-letters/addressing-and-designing/designing-and-packaging-letters)

| Adressfeld | Links | Oben | Breite | Höhe |
| --- | --- | --- | --- | --- |
| Fenster links | 20 | 35.5 | 100 | 45 |
| Fenster rechts | 112 | 45 | 90 | 45 |

Falzmarken beginnen 3,5 mm vom linken Rand und 105 beziehungsweise 210 mm von oben. Setze `foldMarks={false}` für andere Faltungen. Begrenze die Adresszeilen auf das Fenster und prüfe einen Ausdruck im echten Umschlag. Folgeseiten verwenden dieselbe Textspalte.

SWITEC verzeichnet den Rückzug von SN 010130:2010 am 12. Dezember 2016. SN 10130:2026-02 ist eine eigenständige Ausgabe. Die Masse oben bezeichnen die von Alpina umgesetzten und geprüften historischen Profile. [Schweizer Normungsprogramm](https://www.switec.info/media/2025-08_swiss_national_workprogram.pdf) · [Aktuelle Geschäftsbriefnorm](https://www.dinmedia.de/en/standard/sn-10130/400500596)

Öffne den Druckdialog als Benutzeraktion mit `printSwissDocument(articleRef.current)`. Die Funktion isoliert das eingebundene Dokument und stellt die Anwendung nach dem Schliessen wieder her. Drucke auf A4 in Originalgrösse ohne Kopf- und Fusszeilen des Browsers. [Briefbeispiel](https://alpinaui.com/docs/components/letter/)

### Rechnungsmengen und CHF-Beträge

Übergib `quantity` und den Preis ohne MWST `unitPrice` als Zahlen oder Dezimalzeichenketten mit Punkt und bis zu vier Nachkommastellen. `unit` folgt der lokalisierten Menge, beispielsweise `{ description: 'Korrekturlesen', quantity: '2.5', unit: 'h', unitPrice: '80.00', vatRate: 8.1 }`; für Flächen nutze `unit: 'm²'`. Einzelpreise, Zeilenbeträge und Summen zeigen zwei Nachkommastellen. Die Berechnung verwendet den vollen Einzelpreis und rundet das Produkt einmal auf Rappen. Der ursprüngliche Dezimalwert bleibt im HTML-Attribut `data` erhalten. [Rechnungsbeispiel](https://alpinaui.com/docs/components/invoice-document/)

## Auf dem Server validieren

Alpina liefert neun unabhängige Standard-Schema-Validatoren mit lokalisierten Fehlern und typisierten Ausgaben. Der Leitfaden zeigt Integrationen und eine lauffähige Next.js Server Action. [Schweizer Validierung](https://alpinaui.com/docs/guides/validation/)

### Rechnungssummen in Rappen anzeigen

Übergib `calculateInvoiceTotals(lines).totalCents` direkt an `formatCentimes(cents, locale)`. Beispielsweise ergibt `formatCentimes(8005, 'it-CH')` die Anzeige CHF 80.05. Zulässig sind sichere Ganzzahlen und beliebig grosse Ganzzahlen (`bigint`). Verwende `formatCHF` für Ausgangsbeträge in Franken.
