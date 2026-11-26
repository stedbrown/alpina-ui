# Interfacce svizzere

Alpina offre componenti React e funzioni pure per i dati svizzeri. Imposta la lingua del componente o del provider. Le interfacce svizzere supportano it-CH, de-CH, fr-CH e rm-CH.

| Componente | Prop principali | HTML o risultato |
| --- | --- | --- |
| `CurrencyCHF` | `amount: number \| bigint`, `locale?` | `data` con un valore numerico leggibile dal software |
| `SwissDate` | `value: string \| Date`, `locale?`, `dateStyle?`, `timeZone?` | `time` con attributo `datetime` |
| `LocaleSelect` | `value?`, `defaultValue?`, `onLocaleChange?(locale)` | `select` con i nomi delle quattro lingue nella rispettiva lingua |
| `CantonSelect` | `locale?`, `value?`, `defaultValue?`, `placeholder?`, `onCantonChange?(code)` | `select` con i nomi tradotti dei 26 cantoni e le sigle |
| `CantonCombobox` | `locale?`, `value?`, `defaultValue?`, `onCantonChange?(code)`, `name?`, `required?` | Campo di ricerca con etichetta ed elenco dei cantoni |
| `SwissLocalityCombobox` | `locale?`, `value?`, `defaultValue?`, `onLocalityChange?(locality)`, `canton?`, `name?`, `required?` | Campo di ricerca per NPA, località e comuni |
| `SwissPostalCodeInput` | `value?` e `defaultValue?` come stringhe, `required?`, `onChange?` | Campo di testo con tastiera numerica |
| `SwissAddressForm` | `onSave`, `initialValue?`, `locale?`, `labels?`, `className?` | Modulo postale con cinque campi obbligatori |
| `UidInput` | `value?`, `defaultValue?`, `validationMessage?` | Identificativo delle imprese con controllo modulo 11 |
| `Calendar` | `value?`, `defaultValue?`, `onValueChange?`, `defaultMonth?`, `min?`, `max?` | Griglia mensile di date civili |
| `DatePicker` | `label`, `name?`, `value?`, `defaultValue?`, `onValueChange?` | Selettore che restituisce una data civile ISO |

I selettori nativi e il campo NPA inoltrano `ref`, `id`, `name`, `disabled`, `required`, attributi ARIA ed eventi nativi. Associa a ognuno un’etichetta visibile. Per una selezione controllata passa `value` e la callback tipizzata. Con `defaultValue` il browser gestisce la scelta.

## Rumantsch grischun

Usa `rm-CH` per la lingua scritta standard delle pubblicazioni federali. Nel menu appare «Rumantsch» e vale per indirizzi, cantoni, date, festività, importi e cedole QR. All’invio le traduzioni conservano i nomi `title[de]`, `title[fr]`, `title[it]` e `title[rm]`. Con `<MultilingualField locale="rm-CH" … />` l’editor mostra completezza, conteggi e comandi di copia in romancio anche se stai modificando un’altra lingua. [Lia Rumantscha](https://www.liarumantscha.ch/de/raetoromanisch/rumantsch-grischun) · [Cancelleria federale e Pledari Grond](https://www.bk.admin.ch/rm/rumantsch)

Passa `locale="rm-CH"` a `IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` e `SwissPostalCodeInput` per ricevere errori localizzati. Cambiare lingua conserva il valore e aggiorna le indicazioni. `validationMessage` personalizza il messaggio. Sul server `swissValidationMessage('postalCode', 'rm-CH')` restituisce lo stesso testo. [Modulo indirizzo](https://alpinaui.com/docs/components/swiss-address-form/)

| Esempio | Formato romancio |
| --- | --- |
| Quantità | 1 234,50 |
| Importo negativo | CHF −1 234,50 |
| Data estesa | venderdi, ils 19 da favrer 2027 |

```ts
const locale = 'rm-CH'
formatSwissNumber('1234.50', locale, { minimumFractionDigits: 2 })
formatCHF(-1234.5, locale)
formatSwissDate('2027-02-19', locale, { dateStyle: 'full' })
```

Le lingue ICU dipendono dal motore JavaScript. Un tag BCP 47 valido può ripiegare silenziosamente su un’altra lingua. Controlla separatamente `Intl.NumberFormat.supportedLocalesOf(['rm-CH'], { localeMatcher: 'lookup' })` e `Intl.DateTimeFormat.supportedLocalesOf(…)`. Alpina include da CLDR 48 date, mesi, giorni e separatori romanci. Il runtime converte i fusi orari e arrotonda le valute. Per `Intl.DisplayNames`, tempo relativo o numeri in lettere servono dati aggiuntivi se il runtime non li offre. [CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Selezione della lingua ECMA‑402](https://tc39.es/ecma402/#sec-supportedlocales)

## Raccogliere un indirizzo postale

```tsx
import { SwissAddressForm, type SwissAddress } from 'alpina-ui/swiss/swiss-address-form'

export function PostalAddress({ save }: { save: (value: SwissAddress) => Promise<void> }) {
  return <SwissAddressForm locale="it-CH" initialValue={{ canton: 'TI' }} onSave={save} />
}
```

`onSave(address)` riceve `recipient`, `street`, `postalCode`, `locality` e `canton` senza spazi iniziali o finali. I primi quattro sono stringhe, il cantone è un `CantonCode`. Tutti sono obbligatori. Il modulo controlla le quattro cifre dell’NPA e la sigla cantonale, poi porta il focus al primo campo da correggere.

Se ci sono più errori, il riepilogo li elenca nell’ordine dei campi. Ogni link porta il focus al controllo senza cambiare URL. La descrizione spiega la correzione. Il riepilogo si aggiorna mentre scrivi e scompare quando resta un solo errore, ancora visibile accanto al campo.

La callback può restituire una promessa o nessun valore. Durante il salvataggio il modulo sospende le modifiche e gli invii. Se la callback genera un errore o la promessa viene rifiutata, mostra un errore generale, conserva i dati e riattiva il pulsante. L’applicazione decide dove salvare; le cinque voci restano nel DOM durante la correzione.

### Suggerire la località

`SwissAddressFields` aggiunge a un modulo esistente un gruppo di controlli nativi, nomi di campo e suggerimenti di località. Per un modulo controllato usa `value` e `onValueChange`; per uno non controllato usa `defaultValue` con FormData.

```tsx
import { SwissAddressFields } from 'alpina-ui/swiss/swiss-address-form'

export function DeliveryFields() {
  return <SwissAddressFields locale="fr-CH" fields={['street', 'postalCode', 'locality', 'canton']}
    names={{ locality: 'town' }} />
}
```

Dopo quattro cifre `SwissAddressForm` propone località e cantone insieme. Il 6900 comprende Lugano, Massagno e Paradiso; Vulliens (1085) compare in FR e VD. La scelta compila entrambi i campi. L’utente può mantenere l’indirizzo o inserire manualmente i valori, anche per NPA amministrativi assenti dal repertorio residenziale.

`await lookupSwissPostalCode('6900')` restituisce coppie `{ locality, canton }`. Per NPA sconosciuti o incompleti restituisce un array vuoto. La prima ricerca valida importa il dataset su richiesta. Il portale lo carica dalla stessa origine, senza inviare indirizzi a terzi. Il catalogo scaricabile lo include offline.

### Cercare località e comuni

`SwissLocalityCombobox` trova una località dal NPA o dal nome e conserva il comune politico insieme alla scelta. Con 6900 propone Lugano, Massagno e due voci Paradiso, perché gli indirizzi di Paradiso appartengono a due comuni. Viganello restituisce 6962 Viganello nel comune di Lugano. La ricerca ignora accenti e maiuscole, accetta Zuerich per Zürich, entrambi i nomi di Biel/Bienne e Sankt per St.

```tsx
import { SwissLocalityCombobox, type SwissLocality } from 'alpina-ui'

export function Residence({ onChange }: { onChange: (place: SwissLocality | null) => void }) {
  return <SwissLocalityCombobox name="residence" locale="it-CH" required onLocalityChange={onChange} />
}
```

Ogni risultato contiene `postalCode`, `locality`, `municipality`, `bfsNumber` e `canton`. Il numero UST identifica il comune nei registri federali e cantonali. Con `name="residence"` il modulo invia `residence.postalCode`, `residence.locality`, `residence.municipality`, `residence.bfsNumber` e `residence.canton`. Imposta `canton` per limitare i suggerimenti a un cantone. Senza componente, `await searchSwissLocalities('lug', { limit: 5 })` restituisce gli stessi risultati. Una ricerca può unire NPA e nome, come `6900 par`.

L’edizione del 1° novembre 2026 contiene 3 177 NPA residenziali svizzeri, 4 233 coppie località/cantone e 2 112 comuni. Una località divisa tra più comuni compare una volta per comune, a partire da quella con più indirizzi. Alpina conserva i cantoni nelle zone di confine. Il selettore esclude il Liechtenstein. Il repertorio è aggiornato mensilmente. [Elenco ufficiale delle località](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

**Fonte ©swisstopo.** Le condizioni federali OGD permettono adattamento, ridistribuzione e uso commerciale con attribuzione. Cita la fonte anche nelle interfacce personalizzate che mostrano o ridistribuiscono i suggerimenti. [Condizioni d’uso](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices)

Dalla radice del repository esegui `python3 scripts/generate-postal-localities.py` per rigenerare il repertorio offline con la libreria standard di Python. Lo script verifica lo SHA‑256 dello ZIP e produce UTF-8 deterministico. Per aggiornare, scarica il nuovo CSV LV95, annota data e hash e verifica le differenze dopo la generazione. [CSV ufficiale](https://data.geo.admin.ch/ch.swisstopo-vd.ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz/ortschaftenverzeichnis_plz_2056.csv.zip) · [Record STAC](https://data.geo.admin.ch/api/stac/v1/collections/ch.swisstopo-vd.ortschaftenverzeichnis_plz/items/ortschaftenverzeichnis_plz)

### Collegare gli errori di un servizio

Restituisci `{ fieldErrors }` da `onSave` anche in modo asincrono. Le chiavi sono i nomi di campo di `SwissAddress`, i valori sono messaggi nella lingua del modulo. I dati restano visibili con l’errore accanto al campo. Modificarlo cancella solo il suo errore. Se nel frattempo l’utente ha spostato il focus fuori dal modulo, la risposta lo lascia dov’è.

```tsx
import { SwissAddressForm, type SwissAddress, type SwissAddressValidationResult } from 'alpina-ui'

type AddressService = {
  save: (address: SwissAddress) => Promise<void | SwissAddressValidationResult>
}

export function ShippingForm({ save }: AddressService) {
  return <SwissAddressForm locale="it-CH" onSave={save} />
}
```

Un servizio di consegna può restituire `{ fieldErrors: { postalCode: 'La consegna non è disponibile per questo NPA.' } }` con un testo tradotto dall’applicazione. Il modulo controlla già il formato in locale.

Il modulo legge `initialValue?: Partial<SwissAddress>` al primo montaggio. Per un altro indirizzo cambia la `key` React. Cambiare `locale` traduce etichette ed errori preservando i valori. Personalizza i testi con `labels?: Partial<SwissAddressLabels>`, per esempio `labels={{ submit: 'Conferma indirizzo' }}`. `swissAddressLabels` contiene le quattro lingue; i termini romanci seguono i moduli grigionesi. [Modulo cantonale in romancio](https://www.gr.ch/RM/instituziuns/administraziun/diem/hba/vender-dar-en-locaziun/tagungsraeume/Seiten/Reservationsanfrage.aspx)

### Scambiare un indirizzo secondo eCH-0010

Usa `format="ech-person"` o `format="ech-organisation"` per gli indirizzi stradali eCH-0010 8.1.0. L’esempio usa un’organizzazione. Via e numero civico sono separati, due righe aggiuntive sono facoltative e l’NPA deve essere tra 1000 e 9999 inclusi. Per chi memorizza la via su una sola riga resta il modulo a cinque campi. L’applicazione decide se verificare la località nel repertorio. [Norma e schemi XML](https://www.ech.ch/de/ech/ech-0010/8.1.0)

| Campo | Numero massimo di caratteri Unicode |
| --- | ---: |
| Nome o cognome | 30 ciascuno |
| Nome dell’organizzazione | 60 |
| Righe aggiuntive 1 e 2 | 150 ciascuna |
| Via | 150 |
| Numero civico | 30 |
| Località | 40 |

Per una persona `recipient` è il cognome e `firstName` è facoltativo. Per un’organizzazione `recipient` è la ragione sociale. La prima riga può indicare un destinatario presso terzi, la seconda un edificio. `locality` corrisponde a `town` nello schema. Il modulo conserva il cantone, l’oggetto di scambio include codice e nome del Paese. Caselle postali e indirizzi esteri richiedono altri profili.

```tsx
<SwissAddressForm format="ech-organisation" locale="de-CH" onSave={address => {
  const payload = toEchMailAddress(address, 'ech-organisation')
  return savePostalRecord(payload)
}} />
```

`UidInput` accetta CHE e nove cifre, raggruppate o compatte. L’ultima cifra segue il modulo 11 di eCH-0108: 10 non è assegnabile e un multiplo esatto di 11 dà 0. `CHE109322551` appare come `CHE-109.322.551`. Per verificare l’assegnazione consulta il registro IDI. [eCH-0108](https://www.ech.ch/de/ech/ech-0108/6.0.0) · [Registro IDI dell’UST](https://www.bfs.admin.ch/de/unternehmensidentifikation-uid)

## Comporre campi singoli

```tsx
import { CantonSelect, SwissPostalCodeInput } from "alpina-ui"

export function Address() {
  return (
    <fieldset>
      <legend>Indirizzo postale</legend>
      <label htmlFor="canton">Cantone</label>
      <CantonSelect id="canton" name="canton" locale="it-CH" defaultValue="TI" />
      <label htmlFor="postal-code">NPA</label>
      <SwissPostalCodeInput id="postal-code" name="postalCode" required />
    </fieldset>
  )
}
```

`CantonSelect` invia la sigla, per esempio `TI`, anche dopo un cambio di lingua. Per richiedere una scelta usa `placeholder="Scegli un cantone"` e `required`. `cantons` contiene i nomi nelle quattro lingue nell’ordine statistico federale. Ogni voce espone `code` e `names[locale]`. [Atlante statistico](https://datavis.bfs.admin.ch/statatlas/maps/md-13.40/core/projects/13.40/xshared/pdf/134_131.pdf) · [Costituzione federale](https://www.fedlex.admin.ch/eli/cc/1999/404/it) · [Carta dei cantoni in romancio](https://www.bk.admin.ch/dam/bk/de/dokumente/komm-ue/Buku2025/BUKU_2025_RM.pdf.download.pdf/BUKU_2025_RM.pdf)

`SwissPostalCodeInput` verifica le quattro cifre anche all’invio. `isSwissPostalCode(value)` applica lo stesso controllo a una stringa. Per confermare l’esistenza dell’NPA o la località consulta il repertorio ufficiale. [Elenco delle località](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

## Cercare un cantone nelle quattro lingue

```tsx
import { CantonCombobox } from 'alpina-ui/swiss/canton-combobox'

export function CantonOfResidence() {
  return <CantonCombobox name="canton" label="Cantone di domicilio" locale="it-CH" required />
}
```

`CantonCombobox` cerca sigle e nomi in tedesco, francese, italiano e romancio ignorando accenti, maiuscole e trattini. In italiano «Graubunden» trova «Grigioni», GR. La lingua imposta testi e nomi iniziali. Puoi personalizzare `label`, `description`, `error`, `placeholder`, `noResults`, `clearLabel` e `requiredMessage`.

Le frecce scorrono l’elenco; Invio o un clic confermano. Escape, Tab e l’uscita dal campo chiudono l’elenco e ripristinano la scelta confermata. Il pulsante di cancellazione restituisce una stringa vuota. Il focus resta nel campo e `aria-activedescendant` indica l’opzione evidenziata. [Modello WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

Per lo stato controllato usa `value` e `onCantonChange`, altrimenti `defaultValue`. Il valore è `CantonCode | ''`. Con `name`, `FormData` riceve la sigla confermata. `required` attiva la validazione sul campo visibile; `disabled` lo esclude dall’invio. Il reset nativo ripristina il valore iniziale nel modo non controllato.

## Valuta e date

```ts
import { formatCHF } from "alpina-ui/swiss/format-chf"
import { formatSwissDate } from "alpina-ui/swiss/format-swiss-date"

formatCHF(1250.50, "fr-CH")
formatSwissDate("2026-11-24", "rm-CH", { dateStyle: "long" })
formatSwissDate(new Date("2026-03-29T22:30:00Z"), "it-CH")  // 30 marzo a Zurigo
```

`formatCHF(amount, locale?)` accetta un importo finito in franchi e produce due decimali con il codice CHF, nella posizione prevista dalla lingua. Il tedesco e l’italiano separano le migliaia con U+2019, il francese con lo spazio inscindibile stretto U+202F. Usa `bigint` per franchi interi oltre la precisione di `number`.

Per impostazione predefinita l’importo è arrotondato al centesimo. Per i contanti imposta `cashRounding` su `CurrencyCHF` o passa `{ cashRounding: true }` come terzo argomento di `formatCHF`. I casi esattamente a metà vengono arrotondati lontano dallo zero. Applica l’arrotondamento ai cinque centesimi una volta sola, sul totale da pagare. Il valore HTML conserva l’importo iniziale. [Dati Unicode](https://github.com/unicode-org/cldr/blob/release-48/common/supplemental/supplementalData.xml)

`formatSwissDate(value, locale?, options?)` accetta date gregoriane `YYYY-MM-DD` (anni 0001–9999) e oggetti `Date`. Una data civile conserva il giorno in ogni fuso. Un istante usa `Europe/Zurich` con l’ora legale; per cambiarlo passa un fuso IANA in `timeZone`. `dateStyle` accetta `short` (DD.MM.YYYY), `medium`, `long` e `full`. `formatSwissTime(instant, timeZone?)` mostra l’ora su 24 ore; mezzanotte è 00:00. Date non valide e importi infiniti generano `RangeError`.

La settimana inizia il lunedì. Due menu sopra la griglia portano a qualsiasi mese e anno. `captionLayout="label"` mostra invece il mese come testo. Attiva `showWeekNumbers` per i numeri ISO delle settimane. La griglia a sette colonne e il selettore entrano in 180 px CSS. Le intestazioni brevi dei giorni conservano il nome completo per le tecnologie assistive. `isoWeek(day)` restituisce il numero e l’anno ISO della settimana, che a cavallo di Capodanno può differire dall’anno civile.

Per le prenotazioni `dayStatus(date)` riceve la data ISO e restituisce `available`, `full` o `closed`. I fine settimana hanno uno sfondo distinto; una linea continua, puntinata o tratteggiata accompagna lo stato annunciato nella lingua scelta. Le frecce raggiungono anche i giorni indisponibili; attivarli conserva la selezione. `isDateDisabled(date)` e `disableHolidays` prevalgono sulla disponibilità dichiarata. I festivi seguono cantone, regione e modalità, comprese le mezze giornate elencate.

```tsx
<DatePicker locale="fr-CH" canton="VD" disableHolidays name="appointment"
  isDateDisabled={date => clinicClosures.has(date)}
  dayStatus={date => capacity.get(date) === 0 ? 'full' : 'available'} />
```

## Pianificare il lavoro con i festivi

`swissHolidays(year, canton, options?)` restituisce le date in ordine cronologico. Proietta sull’anno gregoriano richiesto le regole dei 26 cantoni verificate nel novembre 2026. Le norme storiche, i diritti salariali, le vacanze scolastiche e le chiusure aziendali richiedono calendari specifici. Solo il 1° agosto è festivo federale. Pasqua, Pentecoste e il Digiuno federale figurano come domeniche, con il Digiuno ginevrino in settembre. [SECO](https://www.seco.admin.ch/dam/de/sd-web/x5LtHPJdNis5/Anhang-Feiertage-Schweiz-Auszug-ArG-ArGV1-5-SECO-SB-2024-DE.pdf) · [DFAE, ricorrenze di settembre](https://www.aboutswitzerland.eda.admin.ch/en/summer-festivals-and-customs)

```tsx
import { Calendar, DatePicker, addBusinessDays, swissHolidays } from 'alpina-ui'

const holidays = swissHolidays(2026, 'FR', { region: 'FR-reformed', locale: 'fr-CH' })
const collection = addBusinessDays('2026-04-02', 1, 'FR', { region: 'FR-reformed' })
// Il ritiro avviene il 7 aprile 2026, dopo il Venerdì santo, il fine settimana e il lunedì di Pasqua.

export function CollectionForm() {
  return <form>
    <Calendar canton="FR" holidayRegion="FR-reformed" locale="fr-CH" />
    <DatePicker canton="FR" holidayRegion="FR-reformed" locale="fr-CH" name="collection" defaultValue={collection} />
  </form>
}
```

Ogni voce ha `id` stabile, `date` ISO, `name` localizzato, `scope` e `duration`. Il calendario segna il giorno, annuncia la festività e ne riporta il nome sotto il mese. La selezione resta possibile. Più feste possono cadere nello stesso giorno.

`addBusinessDays(start, amount, canton, options?)` conta da lunedì a venerdì a partire dal giorno successivo, o da quello precedente per valori negativi. Zero conserva la data. Le festività intere sono saltate, il 1° maggio pomeriggio di Soletta resta un giorno lavorativo. Il regime sostitutivo domenicale di Ginevra per datori non soggetti alla legge federale sul lavoro è fuori da questo calendario. [Ispettorato di Soletta](https://so.ch/verwaltung/volkswirtschaftsdepartement/amt-fuer-wirtschaft-und-arbeit/arbeitsbedingungen/arbeitsinspektorat/feiertage) · [Legge ginevrina, art. 1](https://silgeneve.ch/legis/data/rsg_j1_45.htm)

### Scegliere tra calendario legale e consuetudinario

| Opzione | Contenuto del calendario | Esempio in Argovia |
| --- | --- | --- |
| `observance: 'statutory'` (predefinito) | Festivi legali cantonali e regionali e domeniche nominate. | Il lunedì di Pasqua compare per Aarau, mentre Bremgarten lo lascia disponibile. |
| `observance: 'common'` | Aggiunge chiusure intere, periodiche e documentate per la pianificazione. Hanno `scope: 'customary'`. | Lunedì di Pasqua, lunedì di Pentecoste e Santo Stefano valgono in tutto il cantone. La classificazione legale regionale prevale. |

Usa la stessa opzione in `Calendar`, `DatePicker` e `addBusinessDays`. La modalità comune serve alla pianificazione; contratto e calendario aziendale determinano il congedo effettivo. Sono esclusi feste locali, ponti discrezionali, mezze giornate concesse e giorni sostitutivi specifici del datore di lavoro.

| Territorio | Chiusure intere documentate, se assenti dal profilo legale |
| --- | --- |
| AG, FR | 2 gennaio, lunedì di Pasqua, lunedì di Pentecoste e 26 dicembre. Argovia pubblica il calendario di lavoro; Friburgo indica queste quattro come chiusure più comuni. [Calendario argoviese](https://www.ag.ch/media/kanton-aargau/portal/jobs-karriere/anstellungsbedingungen-dokumente/sollarbeits-und-betriebszeit-2026.pdf) · [Autorità friburghese](https://www.fr.ch/travail-et-entreprises/employes/jours-feries) |
| LU, NW, OW, SO, ZG | Le stesse quattro date figurano in calendari di lavoro o norme amministrative. [Lucerna](https://personal.lu.ch/-/media/Personal/Dokumente/down_load/offentliche_dokumente/Anstellungsbedingungen_fuer_das_Staatspersonal.pdf) · [Nidvaldo, art. 28](https://gesetze.nw.ch/app/de/texts_of_law/171.1) · [Obvaldo](https://www.ow.ch/_docn/6325/Feiertage.pdf) · [Soletta](https://so.ch/fileadmin/internet/fd/fd-pa/Personalamt/03_Anstellungsbedingungen-GAV/20_Arbeitszeit/Sollarbeitszeit_2026_ohne_Vorholzeit.pdf) · [Zugo, § 13](https://bgs.zg.ch/api/de/versions/62/pdf_file) |
| NE | Lunedì di Pasqua, di Pentecoste e lunedì dopo il Digiuno federale sono giorni di chiusura dei negozi con eccezioni. [Neuchâtel](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) |
| VS | Venerdì santo, lunedì di Pasqua, di Pentecoste e 26 dicembre secondo il calendario del personale statale. [Vallese](https://lex.vs.ch/data/172.4/fr) |
| ZH | 2 gennaio (Berchtoldstag), osservato dall’amministrazione cantonale. [Ufficio del personale di Zurigo](https://www.zh.ch/de/arbeiten-beim-kanton/fuer-hr-profis/handbuch-personalrecht/definition/arbeitszeit/grundlagen-zur-arbeitszeit.html) |
| Altri cantoni | I due modi seguono lo stesso calendario legale documentato. |

### Scegliere la regione di lavoro

Il solo codice cantonale restituisce i giorni comuni a tutto il cantone. Scegli un profilo per includere queste regole locali ufficiali. Un profilo di un altro cantone genera `RangeError`.

| Profilo | Territorio |
| --- | --- |
| `AG-aarau` | Aarau, Brugg, Kulm, Lenzburg, Zofingen e il comune di Bergdietikon |
| `AG-baden` | Distretto di Baden escluso Bergdietikon |
| `AG-bremgarten` | Distretto di Bremgarten |
| `AG-laufenburg` | Distretti di Laufenburg e Muri, più Hellikon, Mumpf, Obermumpf, Schupfart, Stein e Wegenstetten |
| `AG-rheinfelden` | Kaiseraugst, Magden, Möhlin, Olsberg, Rheinfelden, Wallbach, Zeiningen e Zuzgen |
| `AG-zurzach` | Distretto di Zurzach |
| `FR-catholic`, `FR-reformed` | Zona legale del luogo di lavoro definita dal cantone, indipendentemente dalla religione personale |
| `SO-outside-bucheggberg` | Soletta escluso il Bucheggberg, per cui vale il solo cantone |
| `NE-le-landeron` | Le Landeron aggiunge il Corpus Domini |
| `AI-inner` | Il territorio interno di Appenzello Interno aggiunge San Maurizio |
| `OW-engelberg` | Engelberg aggiunge San Benedetto |

Le zone sono definite dal [diritto del lavoro argoviese, § 6](https://gesetzessammlungen.ag.ch/app/de/texts_of_law/961.200), dal [servizio del lavoro friburghese](https://www.fr.ch/travail-et-entreprises/employes/jours-feries), dal [decreto neocastellano](https://rsn.ne.ch/DATA/program/books/rsne/pdf/941.020.pdf), da [Appenzello Interno](https://ai.ch/themen/wirtschaft-und-arbeit/feiertage-ruhetage/) e da [Obvaldo](https://www.ow.ch/_docn/6325/Feiertage.pdf).

### Verificare l’ambito di una festività

Ticino e Giura prevedono altri giorni ufficiali di riposo, fra cui il 29 e il 23 giugno rispettivamente. Un giorno di riposo cantonale può restare feriale ai sensi della legge federale sul lavoro. Il Knabenschiessen a Zurigo dipende dal datore di lavoro. [Ticino](https://www4.ti.ch/dfe/de/uil/legge-lavoro/giorni-festivi-in-ticino-1) · [Giura](https://rsju.jura.ch/fr/viewdocument.html?Download=1&id=38948&idn=9554&v=2) · [Autorità zurighese](https://www.zh.ch/de/wirtschaft-arbeit/arbeitsbedingungen/arbeitsssicherheit-gesundheitsschutz/arbeits-ruhezeiten/feiertage.html)

Glarona rinvia di una settimana la Näfelser Fahrt quando coinciderebbe con il Giovedì santo. A Neuchâtel il 2 gennaio e il 26 dicembre contano solo se lunedì. Il Digiuno vodese cade il lunedì dopo la terza domenica di settembre. [Glarona](https://www.gl.ch/portrait/naefelser-fahrt.html/207) · [Neuchâtel](https://www.ne.ch/themes/economie-et-emploi/jours-feries-officiels) · [Vaud](https://www.vd.ch/formation/jours-feries-et-vacances-scolaires/jours-feries-et-vacances-scolaires-2026)

I calendari cantonali mostrano anche le differenze fra cantoni vicini. [Lucerna](https://srl.lu.ch/app/de/texts_of_law/855) · [Uri](https://www.ur.ch/_docn/404812/%C3%9Cbersicht_Feiertage_Kanton_Uri_gem._ArG_und_LSG.pdf) · [Svitto](https://www.sz.ch/public/upload/assets/71606/Kantonale_lokale_und_nationale_Feiertage.pdf) · [Nidvaldo](https://gesetze.nw.ch/app/de/texts_of_law/921.1) · [Zugo](https://zg.ch/de/migration-integration/neu-in-zug/gut-zu-wissen) · [Turgovia](https://www.rechtsbuch.tg.ch/app/de/change_documents/80) · [Grigioni](https://www.gr-lex.gr.ch/api/de/versions/2604/pdf_file)

## Dati linguistici per date e valuta

I formattatori, riutilizzati fra chiamate sul client e sul server, usano `Intl`. Per tedesco, francese e italiano si richiede prima la lingua scelta, poi le alternative svizzere disponibili. Versioni diverse dei dati possono cambiare la punteggiatura. I nomi dei cantoni e delle lingue provengono dai dati inclusi. [API ECMAScript](https://tc39.es/ecma402/2026/#locale-and-parameter-negotiation)

Senza dati romanci nel runtime Alpina usa CLDR 48 per CHF e date gregoriane. Per `2026-04-05` in formato `full` mostra *dumengia, ils 5 d’avrigl 2026*. `Intl` continua a gestire arrotondamento e data nel fuso richiesto. Importare il solo formattatore CHF esclude nomi di mesi e giorni. La licenza Unicode-3.0 si trova in `UNICODE-LICENSE.txt`. [CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Licenza Unicode](https://github.com/unicode-org/cldr/blob/release-48/LICENSE)

## Citare un testo svizzero

Imposta la lingua sul contenitore più vicino, per esempio `<p lang="fr-CH"><q>Bonjour</q></p>`. Il tema usa caporali doppi per la citazione esterna e singoli per `q` annidato. Il francese aggiunge uno spazio stretto inscindibile all’interno, le altre tre lingue no. Il tedesco segue l’ortografia svizzera. [Istruzioni della Cancelleria federale](https://www.bk.admin.ch/de/schreibweisungen)

## Limitare il selettore a due lingue

`<LocaleSelect locales={['it-CH', 'de-CH']} value={language} onLocaleChange={setLanguage} />` mostra i due nomi nella loro lingua e nell’ordine richiesto. Nel modo controllato `value` deve corrispondere a una lingua disponibile. Lo stesso stato può pilotare componenti e testi dell’app. Per ordinare nomi in una tabella bilingue usa `Intl.Collator(language)` nel comparatore.

## Filtrare tutti i cantoni

`CantonSelect allLabel="Tutti i cantoni"` permette di tornare a tutti i cantoni dopo una scelta. Usa «Alle Kantone» in tedesco. `event.currentTarget.value` in `onChange` fornisce la sigla o la stringa vuota. `onCantonChange` comunica solo codici cantonali. `allLabel` prevale su `placeholder`. Senza `allLabel` il segnaposto mantiene il comportamento abituale.
## Conti bancari, numeri AVS e telefoni

`IbanInput`, `AhvInput`, `UidInput`, `PhoneInput` e `SwissPostalCodeInput` accettano `onValueChange(value, { normalized, valid })`. Il primo argomento segue il testo modificabile e il formato applicato all’uscita. `onChange` continua a segnalare la digitazione. Per `0791234567` il valore normalizzato è `+41791234567`; all’uscita il testo diventa `+41 79 123 45 67` e il valore normalizzato resta invariato.

`normalized` corrisponde al risultato valido di Standard Schema. I valori vuoti o non validi danno `null`. `valid` considera formato, cifra di controllo e obbligatorietà. Un campo facoltativo vuoto è valido.

```tsx
<PhoneInput name="phone" defaultValue="0791234567" onValueChange={(display, details) => {
  setPhoneLabel(display)
  setContactNumber(details.normalized)
}} />
```

Usa `IbanInput` per i conti CH e LI di 21 caratteri. `isSwissIban` verifica Paese, struttura e cifre di controllo modulo 97. `compactIban` prepara il valore convalidato per il salvataggio. La cifra di controllo conferma la struttura; per la titolarità occorre una verifica separata. [Indicazioni di SIX](https://www.six-group.com/en/products-services/banking-services/payment-standardization/standards/iban.html)

`AhvInput` verifica prefisso 756 e cifra EAN‑13, poi raggruppa le 13 cifre. `PhoneInput` accetta nove cifre nazionali, il prefisso nazionale oppure +41 o 0041. I due campi formattano i valori validi all’uscita e mantengono le bozze non valide per correggerle. Personalizza gli errori con `validationMessage` e usa i validatori esportati all’invio. [Ufficio centrale di compensazione](https://www.zas.admin.ch/de/ahv-nummer-identifikator) · [Numerazione UFCOM](https://www.bakom.admin.ch/de/telefonnummern)

`SwissQrBill` mostra sezione pagamento e ricevuta. La guida tratta riferimenti, indirizzi strutturati e stampa. [Guida alla QR-fattura](https://alpinaui.com/docs/guides/qr-bill/)

## Modificare le traduzioni

`MultilingualField` raccoglie le quattro lingue nazionali nello stesso modulo. Una traduzione è completa se contiene caratteri diversi da spazi. Ogni editor indica la propria lingua per ortografia e pronuncia. Le schede restano montate: l’invio nativo include anche le traduzioni vuote.

```tsx
<MultilingualField name="title" label="Titolo della mostra" sourceLanguage="de"
  defaultValue={{ de: 'Die neue Typografie' }} includeEnglish />
```

Leggi `formData.get('title[fr]')` nel gestore di invio o in una Server Action. Scegli `layout="columns"` per il confronto o `variant="textarea"` per testi lunghi. La copia compila soltanto una destinazione vuota. `value` e `onValueChange` controllano il valore; `labels` traduce conteggi, stato e comandi. Dove disponibili, i conteggi usano gruppi di grafemi.

## Stampare una lettera commerciale

`Letter` stampa su A4 e accetta mittente e destinatario come righe, `SwissQrAddress` o `EchMailAddress`. Per riusare le righe chiama `addressLines(address, locale)`. In Svizzera l’indirizzo termina con NPA e località. Il formato eCH conserva organizzazioni, contatti, appartamenti, caselle postali e nomi di Paesi forniti. Per indirizzi QR esteri usa il nome tradotto del Paese, se disponibile, altrimenti il codice ISO. [Esempi della Posta](https://www.post.ch/en/sending-letters/addressing-and-designing/addressing-consignments-correctly)

Fornisci oggetto, data e corpo della lettera. Scegli `windowPosition="left"` o `"right"` in base alla busta. Le misure seguenti in millimetri partono dall’angolo superiore sinistro e riproducono i profili storici pubblici SN e SNleft di KOMA-Script. [KOMA-Script, tabella 4.19](https://mirrors.mit.edu/CTAN/macros/latex/contrib/koma-script/doc/scrguide-en.pdf) · [Modelli di buste della Posta](https://www.post.ch/en/sending-letters/addressing-and-designing/designing-and-packaging-letters)

| Indirizzo | Sinistra | Alto | Larghezza | Altezza |
| --- | --- | --- | --- | --- |
| Finestra a sinistra | 20 | 35.5 | 100 | 45 |
| Finestra a destra | 112 | 45 | 90 | 45 |

I segni di piega iniziano a 3,5 mm dal bordo sinistro, a 105 e 210 mm dall’alto. Per altre pieghe usa `foldMarks={false}`. Limita le righe a quelle che entrano nella finestra e prova un foglio con la busta reale. Le pagine successive mantengono la stessa colonna di testo.

SWITEC indica il ritiro di SN 010130:2010 il 12 dicembre 2016. SN 10130:2026-02 è un’edizione distinta. Le misure sopra identificano i profili storici implementati e verificati da Alpina. [Programma svizzero di normazione](https://www.switec.info/media/2025-08_swiss_national_workprogram.pdf) · [Norma attuale](https://www.dinmedia.de/en/standard/sn-10130/400500596)

Apri la finestra di stampa da un’azione dell’utente con `printSwissDocument(articleRef.current)`. Il comando isola il documento montato e ripristina l’app dopo la chiusura. Stampa su A4 in dimensioni reali disattivando intestazioni e piè di pagina del browser. [Esempio di lettera](https://alpinaui.com/docs/components/letter/)

### Quantità e importi in CHF nella fattura

Fornisci `quantity` e `unitPrice` al netto dell’IVA come numeri o stringhe decimali con punto, fino a quattro cifre decimali. `unit` segue la quantità localizzata, per esempio `{ description: 'Revisione della bozza', quantity: '2.5', unit: 'h', unitPrice: '80.00', vatRate: 8.1 }`. Per una superficie usa `unit: 'm²'`. Prezzi unitari, importi di riga e totali mostrano due decimali. Il calcolo usa l’intero prezzo concordato e arrotonda il prodotto una volta al centesimo. L’attributo HTML `data` del prezzo conserva i decimali iniziali. [Esempio di fattura](https://alpinaui.com/docs/components/invoice-document/)

## Validare sul server

Alpina esporta nove validatori Standard Schema senza dipendenze, con errori localizzati e risultati tipizzati. La guida include le integrazioni e una Server Action Next.js eseguibile. [Validazione svizzera](https://alpinaui.com/docs/guides/validation/)

### Visualizzare i totali in centesimi

Passa `calculateInvoiceTotals(lines).totalCents` direttamente a `formatCentimes(cents, locale)`. Per esempio `formatCentimes(8005, 'it-CH')` mostra CHF 80.05. La funzione accetta interi sicuri e interi a precisione arbitraria (`bigint`). Usa `formatCHF` se il valore di origine è già in franchi.
