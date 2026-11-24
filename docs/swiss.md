# Interfacce svizzere

Alpina distribuisce nove componenti React e alcune funzioni pure per dati svizzeri. I componenti accettano la lingua in modo esplicito. Se omessa, usano `it-CH`. Le altre scelte sono `de-CH`, `fr-CH` e `rm-CH`.

| Componente | Proprietà principali | Elemento |
| --- | --- | --- |
| `CurrencyCHF` | `amount: number \| bigint`, `locale?` | `data` con valore numerico leggibile dal software |
| `SwissDate` | `value: string \| Date`, `locale?`, `dateStyle?`, `timeZone?` | `time` con attributo `datetime` |
| `LocaleSelect` | `value?`, `defaultValue?`, `onLocaleChange?(locale)` | `select` con i quattro endonimi |
| `CantonSelect` | `locale?`, `value?`, `defaultValue?`, `placeholder?`, `onCantonChange?(code)` | `select` con i 26 nomi nella lingua scelta e le sigle |
| `CantonCombobox` | `locale?`, `value?`, `defaultValue?`, `onCantonChange?(code)`, `name?`, `required?` | Campo di ricerca con etichetta e lista dei cantoni |
| `SwissPostalCodeInput` | `value?` e `defaultValue?` di tipo `string`, `required?`, `onChange?` | `input` testuale con tastierino numerico |
| `SwissAddressForm` | `onSave`, `initialValue?`, `locale?`, `labels?`, `className?` | Modulo di indirizzo postale con cinque campi obbligatori |
| `Calendar` | `value?`, `defaultValue?`, `onValueChange?`, `defaultMonth?`, `min?`, `max?` | Griglia mensile di date civili |
| `DatePicker` | `label`, `name?`, `value?`, `defaultValue?`, `onValueChange?` | Selettore che restituisce una data civile ISO |

I tre campi inoltrano `ref`, `id`, `name`, `disabled`, `required`, gli attributi ARIA e gli eventi nativi. Assegna un’etichetta visibile. Per selettori controllati usa `value` e la callback tipizzata. Con `defaultValue` lo stato è gestito dal browser.

## Raccogliere un indirizzo

```tsx
import { SwissAddressForm, type SwissAddress } from 'alpina-ui/swiss/swiss-address-form'

export function IndirizzoPostale({ salva }: { salva: (value: SwissAddress) => Promise<void> }) {
  return <SwissAddressForm locale="it-CH" initialValue={{ canton: 'TI' }} onSave={salva} />
}
```

`onSave(address)` riceve `recipient`, `street`, `postalCode`, `locality` e `canton`, dopo la rimozione degli spazi ai margini. I primi quattro valori sono stringhe. Il cantone è una sigla di tipo `CantonCode`. Tutti i campi sono obbligatori. Il modulo controlla anche le quattro cifre dell’NPA e l’appartenenza del cantone all’elenco. Se ci sono errori, posiziona il focus sul primo campo da correggere.

Quando più campi richiedono una correzione, il riepilogo elenca i loro nomi nell’ordine del modulo. Ogni collegamento sposta il cursore sul controllo corrispondente e conserva l’URL corrente. La descrizione associata al campo spiega l’errore. Il riepilogo si aggiorna mentre scrivi e scompare quando resta un solo errore, ancora visibile sul campo.

La callback può terminare senza un valore oppure restituire una promessa. Durante il salvataggio il modulo sospende l’invio e la modifica dei campi. Se la callback genera un’eccezione o la promessa viene rifiutata, mostra il messaggio di errore generale, conserva i valori e rende disponibile il pulsante per riprovare. L’applicazione decide dove salvare l’indirizzo. Il modulo passa i cinque campi a `onSave` e li mantiene nel DOM durante la correzione.

### Collegare gli errori del proprio servizio

Se l’applicazione riconosce un errore su uno o più campi, restituisce `{ fieldErrors }` da `onSave`, anche in modo asincrono. Le chiavi sono nomi di `SwissAddress`. I valori sono messaggi di testo leggibili nella lingua corrente. Il modulo conserva la digitazione e mostra ogni messaggio accanto al suo campo. Modificare un campo rimuove il relativo errore applicativo. Gli altri errori rimangono disponibili. Se l’utente ha già spostato il focus fuori dal modulo mentre attende la risposta, il modulo rispetta la nuova posizione.

```tsx
import { SwissAddressForm, type SwissAddress, type SwissAddressValidationResult } from 'alpina-ui'

type ServizioIndirizzi = {
  salva: (indirizzo: SwissAddress) => Promise<void | SwissAddressValidationResult>
}

export function ModuloSpedizione({ salva }: ServizioIndirizzi) {
  return <SwissAddressForm locale="it-CH" onSave={salva} />
}
```

Per esempio, un servizio che verifica la zona di consegna può restituire `{ fieldErrors: { postalCode: 'Al momento il servizio di consegna non copre questo NPA.' } }`. Il testo proviene dall’applicazione. Il modulo esegue localmente i soli controlli di formato descritti sopra.

`initialValue?: Partial<SwissAddress>` viene letto al primo montaggio. Per aprire un diverso indirizzo usa una nuova `key` React. Il cambio di `locale` aggiorna le etichette e gli errori mantenendo i valori correnti. Con `labels?: Partial<SwissAddressLabels>` puoi personalizzare tutti i testi, per esempio `labels={{ submit: 'Conferma indirizzo' }}`. La mappa `swissAddressLabels` espone i testi delle quattro lingue. La terminologia dei campi romanci segue i moduli del Cantone dei Grigioni. [Modulo cantonale in romancio](https://www.gr.ch/RM/instituziuns/administraziun/diem/hba/vender-dar-en-locaziun/tagungsraeume/Seiten/Reservationsanfrage.aspx)

## Comporre i campi singoli

```tsx
import { CantonSelect, SwissPostalCodeInput } from "alpina-ui"

export function Indirizzo() {
  return (
    <fieldset>
      <legend>Indirizzo postale</legend>
      <label htmlFor="cantone">Cantone</label>
      <CantonSelect id="cantone" name="cantone" locale="it-CH" defaultValue="TI" />
      <label htmlFor="npa">Numero postale d’avviamento</label>
      <SwissPostalCodeInput id="npa" name="npa" required />
    </fieldset>
  )
}
```

Il valore trasmesso da `CantonSelect` è sempre la sigla, ad esempio `TI`, anche dopo un cambio lingua. Per chiedere una scelta esplicita, usa `placeholder="Scegli un cantone"` e `required`. I nomi tedeschi, francesi, italiani e romanci sono inclusi nel dataset `cantons`, in ordine statistico federale. Ogni voce espone `code` e `names[locale]`. [Atlante statistico della Svizzera](https://datavis.bfs.admin.ch/statatlas/maps/md-13.40/core/projects/13.40/xshared/pdf/134_131.pdf) · [Costituzione federale](https://www.fedlex.admin.ch/eli/cc/1999/404/it) · [La Confederaziun, carta dals chantuns](https://www.bk.admin.ch/dam/bk/de/dokumente/komm-ue/Buku2025/BUKU_2025_RM.pdf.download.pdf/BUKU_2025_RM.pdf)

`SwissPostalCodeInput` usa il controllo di validità HTML per il formato a quattro cifre, anche durante l’invio del modulo. La funzione `isSwissPostalCode(value)` esegue lo stesso controllo su una stringa. L’esistenza dell’NPA e la corrispondenza con una località richiedono il repertorio postale. [Elenco ufficiale delle località](https://www.swisstopo.admin.ch/en/official-directory-of-towns-and-cities)

## Cercare un cantone nelle quattro lingue

```tsx
import { CantonCombobox } from 'alpina-ui/swiss/canton-combobox'

export function CantoneDiDomicilio() {
  return <CantonCombobox name="canton" label="Cantone di domicilio" locale="it-CH" required />
}
```

`CantonCombobox` cerca direttamente nelle sigle e nei nomi tedeschi, francesi, italiani e romanci. Ad esempio, digitando “Graubunden” nell’interfaccia italiana compare “Grigioni” con la sigla GR. La ricerca ignora accenti, maiuscole e trattini. La lingua scelta regola etichette e risultati visualizzati. Puoi personalizzare `label`, `description`, `error`, `placeholder`, `noResults`, `clearLabel` e `requiredMessage`.

Le frecce muovono la selezione nella lista, Invio conferma l’opzione evidenziata e un clic seleziona direttamente il cantone. Esc, Tab e lo spostamento del focus chiudono la ricerca e ripristinano il valore confermato. Il pulsante di cancellazione restituisce una stringa vuota. La lista mantiene il focus DOM nel campo e segnala l’opzione evidenziata con `aria-activedescendant`. [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

Per controllare lo stato, passa `value` e `onCantonChange`. Per la modalità autonoma usa `defaultValue`. Il valore è sempre `CantonCode | ''`. Con `name` impostato, `FormData` riceve la sigla confermata. `required` usa la validazione HTML del campo visibile. `disabled` esclude il valore dall’invio del modulo. Il reset HTML ripristina il valore iniziale in modalità autonoma.

## Valuta e date

```ts
import { formatCHF } from "alpina-ui/swiss/format-chf"
import { formatSwissDate } from "alpina-ui/swiss/format-swiss-date"

formatCHF(1250.50, "fr-CH")
formatSwissDate("2026-11-24", "rm-CH", { dateStyle: "long" })
formatSwissDate(new Date("2026-03-29T22:30:00Z"), "it-CH")  // 30 marzo a Zurigo
```

`formatCHF(amount, locale?)` riceve franchi, accetta valori finiti e mostra due decimali con il codice CHF. Spazi, separatori e posizione del codice seguono la lingua. L’arrotondamento riguarda la visualizzazione al centesimo. Per importi interi oltre la precisione di `number` passa un `bigint`.

`formatSwissDate(value, locale?, options?)` accetta date civili gregoriane nel formato esatto `YYYY-MM-DD` (anni da 0001 a 9999) e oggetti `Date`. Una data civile conserva il suo giorno in ogni fuso. Un oggetto `Date` viene visualizzato nel fuso `Europe/Zurich`, con il cambio stagionale dell’ora. Per gli istanti puoi passare un altro fuso IANA in `timeZone`. I valori di `dateStyle` sono `short`, `medium` (predefinito), `long` e `full`. Date impossibili e importi infiniti generano un `RangeError`.

I formattatori usano `Intl` del browser e del server e vengono riutilizzati. Per il tedesco, il francese e l’italiano vengono richieste prima la lingua scelta e poi le altre varianti svizzere disponibili. Le versioni dei dati linguistici del browser e del server possono influire sulla punteggiatura. I nomi dei cantoni e delle lingue provengono dal dataset incluso. [Specifiche ECMAScript Internationalization API](https://tc39.es/ecma402/2026/#locale-and-parameter-negotiation)

Se il runtime manca dei dati romanci, Alpina usa i modelli di Unicode CLDR 48 per formattare CHF e date gregoriane in romancio. Per esempio, la data `2026-04-05` in formato `full` appare come *dumengia, ils 5 d’avrigl 2026*. Il fallback usa ancora `Intl` per l’arrotondamento dei numeri e per ottenere giorno, mese e anno nel fuso richiesto. L’importazione del solo formattatore CHF esclude i nomi dei mesi e dei giorni. I dati sono distribuiti secondo la licenza Unicode-3.0, inclusa in `UNICODE-LICENSE.txt`. [Dati romanci CLDR 48](https://github.com/unicode-org/cldr/blob/release-48/common/main/rm.xml) · [Licenza Unicode](https://github.com/unicode-org/cldr/blob/release-48/LICENSE)

## Un selettore per due lingue

`<LocaleSelect locales={['it-CH', 'de-CH']} value={lingua} onLocaleChange={cambiaLingua} />` mostra i due endonimi nell’ordine richiesto. Con un campo controllato, conserva in `value` una delle lingue offerte. Puoi gestire nello stesso stato sia i componenti Alpina sia le stringhe dell’applicazione. Per le tabelle di testo bilingui usa un `Intl.Collator(lingua)` nel confronto delle colonne ordinate per nome.

## Un filtro su tutti i cantoni

`CantonSelect` con `allLabel="Tutti i cantoni"` permette di tornare alla scelta iniziale dopo aver selezionato un cantone. Per una pagina tedesca passa un’etichetta come «Alle Kantone». Lo stato del filtro può usare il valore nativo `event.currentTarget.value` di `onChange`, che vale una sigla o la stringa vuota. `onCantonChange` continua ad annunciare solo le sigle. `allLabel` ha precedenza su `placeholder`. Senza `allLabel` il segnaposto dei moduli mantiene il proprio comportamento.
