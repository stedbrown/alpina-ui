# Componenti di base

I componenti di base coprono tipografia, griglie, moduli, tabelle, contenitori, stati e navigazione. Gli esempi importano i componenti dal pacchetto e presuppongono che l'app abbia già caricato `alpina-ui/styles.css`. Se hai copiato i sorgenti con la CLI, cambia gli import per usare i percorsi locali. Ogni file TSX importa il proprio CSS.

## Tema e stati visivi

Bianco e nero definiscono il campo di lettura. Il rosso #EB0000 identifica l’azione primaria, la voce corrente e gli errori accompagnati da testo. Il contorno di focus usa l’inchiostro del tema. I filetti usano trasparenze dell’inchiostro. Puoi cambiare i token sul contenitore di un’applicazione.

| Variabili | Applicazione |
| --- | --- |
| `--al-bg`, `--al-surface`, `--al-soft`, `--al-hover` | Pagina, pannelli, riempimenti secondari e passaggio del puntatore. |
| `--al-ink`, `--al-muted` | Testo principale, descrizioni e indicazioni di aiuto. |
| `--al-line`, `--al-control` | Divisori tra contenuti e contorni dei controlli. |
| `--al-accent`, `--al-on-accent`, `--al-accent-hover`, `--al-focus` | Azioni, testo sull'accento, passaggio del puntatore sull'azione primaria e focus. |
| `--al-success`, `--al-warning`, `--al-danger` | Stati applicativi accompagnati da un'etichetta o un messaggio. |
| `--al-font`, `--al-display`, `--al-mono` | Testo e titoli condividono la famiglia Helvetica Neue, Helvetica, Arial, con una sans-serif di sistema come ultima scelta. Il token monospaziato è disponibile per codice e riferimenti tecnici. |
| `--al-unit`, `--al-space-1`…`--al-space-12`, `--al-space-16` | Il modulo vale 0,25 rem. Il numero indica quanti moduli occupa uno spazio. Per esempio, `--al-space-3` vale 12 px con la radice a 16 px. |
| `--al-type-*`, `--al-leading-*` | Dimensione del carattere e interlinea indipendenti per ogni ruolo. La scala Alpina in px è caption 12/16, label 14/20, body 16/24, heading 24/28, display 48/48 e display-lg 64/64 con la radice a 16 px. |
| `--al-radius`, `--al-shadow`, `--al-shadow-raised` | Raggio di base, rilievo dei controlli e pannelli sovrapposti. |

Il pulsante standard e i campi sono alti almeno 44 px con un carattere base di 16 px. Sui dispositivi con puntatore poco preciso aumentano anche le aree attive delle caselle, dei radio e dei pulsanti compatti. Lo spinner avanza a otto scatti e si ferma quando è attiva la preferenza per il movimento ridotto. Il testo associato resta disponibile ai lettori di schermo.

## Controlli e moduli

Le proprietà HTML indicate appartengono all'elemento sottostante e comprendono attributi ARIA, eventi e `className`. Nei controlli di testo e selezione puoi usare le coppie native `value`/`onChange` oppure `defaultValue`. Per le caselle e gli interruttori usa `checked`/`onChange` oppure `defaultChecked`. Button, Input, Textarea, Select, Checkbox e Switch inoltrano il `ref` al nodo HTML.

| Esportazione | Proprietà e valori predefiniti | Uso |
| --- | --- | --- |
| `Button` | Proprietà di `button`. `variant` accetta `primary` (predefinita), `secondary`, `outline`, `ghost`, `danger`. `size` accetta `sm`, `md` (predefinita), `lg`. | Il tipo predefinito è `button`. Specifica `type="submit"` per inviare il modulo. Assegna un nome accessibile ai pulsanti con sola icona. |
| `Input` | Proprietà di `input`. Il tipo predefinito è `text`. | Supporta tipi nativi come `email`, `date`, `number`, con `name`, `autoComplete`, `required` e i vincoli del browser. |
| `Textarea` | Proprietà di `textarea`. `rows` vale 3 per impostazione predefinita. | Adatta l'altezza iniziale con `rows` e la lunghezza massima con `maxLength`. |
| `Select` | Proprietà di `select` e figli `option` o `optgroup`. | Il browser gestisce tastiera, ricerca per iniziale e selezione su dispositivi mobili. |
| `Checkbox` | Proprietà di `input` con tipo fisso `checkbox`. | Usa un'etichetta associata. Imposta `value` se vuoi un valore specifico nei dati del modulo. |
| `Switch` | Proprietà di `input` con tipo fisso `checkbox` e ruolo `switch`. | Indica uno stato binario. Mantieni stabile l'etichetta quando cambia lo stato, per esempio «Notifiche email». |
| `RadioGroup` | `label: ReactNode`, `options: readonly RadioOption[]`, `value?`, `defaultValue?`, `onValueChange?(value)`, `required?`, proprietà di `fieldset` eccetto `children` e `onChange`. | Ogni opzione ha `value: string` univoco, `label: ReactNode` e `disabled?: boolean`. Il gruppo genera un nome comune oppure accetta `name`. Per la serializzazione del modulo imposta un nome stabile. |
| `Field` | `label: ReactNode`, `children(control): ReactNode`, `id?`, `description?`, `error?`, `describedBy?: string`, proprietà di `div`. | Il callback riceve `FieldControlProps`. Distribuiscile sul controllo con `{...control}`. L'eventuale `id` identifica il controllo. `describedBy` aggiunge ID esterni, separati da spazi, a quelli del suggerimento e dell'errore. |

### Un modulo con errore associato al campo

L'etichetta porta il focus al campo. Quando l'indirizzo è incompleto, Field collega sia l'aiuto sia l'errore all'input e imposta `aria-invalid`. Il componente chiamante decide quando mostrare l'errore e cosa fare con i dati validi.

```tsx
import { useState } from "react"
import { Button, Field, Input, Select } from "alpina-ui"

export function ContactForm({ onSave }: { onSave: (data: FormData) => void }) {
  const [error, setError] = useState("")
  return (
    <form onSubmit={event => {
      event.preventDefault()
      onSave(new FormData(event.currentTarget))
    }}>
      <Field label="Indirizzo email" description="Riceverai qui la conferma." error={error}>
        {control => (
          <Input {...control} name="email" type="email" autoComplete="email" required
            onInvalid={() => setError("Inserisci un indirizzo email valido.")}
            onInput={event => {
              if (event.currentTarget.validity.valid) setError("")
            }} />
        )}
      </Field>
      <Field label="Lingua di contatto">
        {control => (
          <Select {...control} name="language" defaultValue="it">
            <option value="it">Italiano</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </Select>
        )}
      </Field>
      <Button type="submit">Salva contatto</Button>
    </form>
  )
}
```

## Contenitori, stati e navigazione

| Esportazione | Proprietà e valori predefiniti | Uso |
| --- | --- | --- |
| `Badge` | Proprietà di `span`. `tone` accetta `neutral` (predefinito), `accent`, `success`, `danger`. | Inserisci un testo che identifichi lo stato anche senza colore. |
| `Card` | Proprietà di `div`. `CardHeader`, `CardContent` e `CardFooter` accettano proprietà di `div`. | Componi liberamente le sezioni desiderate. |
| `CardTitle`, `CardDescription` | Il titolo accetta proprietà di intestazione e `as` da `h1` a `h6`, con `h2` predefinito. La descrizione accetta proprietà di `p`. | Scegli il livello del titolo in base alla struttura della pagina. |
| `Alert` | Proprietà di `div`, `title?: ReactNode`, `children`. `tone` accetta `info` (predefinito), `success`, `warning`, `danger`. | Per un aggiornamento dinamico usa `role="status"`. Riserva `role="alert"` ai messaggi urgenti. |
| `Table`, `TableCaption` | Proprietà di `table` e `caption`. | Una didascalia descrive lo scopo della tabella. |
| `TableHeader`, `TableBody`, `TableFooter`, `TableRow` | Proprietà di `thead`, `tbody`, `tfoot` e `tr`. | Mantieni la gerarchia HTML nativa delle sezioni e delle righe. |
| `TableHead`, `TableCell` | Proprietà di `th` e `td`. `TableHead` usa `scope="col"` per impostazione predefinita. | Per un'intestazione di riga usa `scope="row"`. |
| `DataTable<Row>` | `rows`, `columns`, `rowKey`, `caption`, `empty`, `sort?`, `defaultSort?`, `onSortChange?`. | Costruisce una tabella dai dati e consente di ordinare le colonne dotate di comparatore. |
| `Separator` | Proprietà di `div` eccetto `children` e `role`. `orientation` accetta `horizontal` (predefinito) o `vertical`. `decorative` vale `true`. | Imposta `decorative={false}` quando la separazione deve essere annunciata. |
| `Progress` | `label: string`, `value?: number`, `max?: number` (100), altre proprietà di `progress`. | Ometti `value` se la durata è sconosciuta. I valori finiti vengono limitati all'intervallo fra zero e `max`. |
| `Spinner` | `label?: string`, proprietà di `span` eccetto `children`. | Con un'etichetta espone uno stato testuale. Accanto a un testo di caricamento già visibile, ometti `label` per lasciare lo spinner decorativo. |
| `Skeleton` | Proprietà di `div` eccetto `children`. | Imposta le dimensioni con `className` o `style` e `aria-busy` sul contenitore in aggiornamento. Il segnaposto è decorativo. |
| `Breadcrumb` | `label: string`, `items: readonly BreadcrumbItem[]`, altre proprietà di `nav` eccetto `children`. | Ogni voce ha `label: ReactNode` e `href?: string`. L'ultima voce riceve `aria-current="page"`. |
| `Pagination` | `label: string`, `items: readonly PaginationItem[]`, `currentPage: number`, altre proprietà di `nav` eccetto `children`. | Ogni voce ha `page` univoca, `href`, `label?: ReactNode` e `accessibleLabel?: string`. Fornisci gli URL reali e includi la pagina corrente nelle voci. |

Ogni esportazione di componente ha un tipo omonimo con il suffisso `Props`. Sono disponibili anche `RadioOption`, `FieldControlProps`, `DataColumn<Row>`, `DataSort`, `BreadcrumbItem` e `PaginationItem`.

### Ordinare gli importi in franchi

Nell'esempio la cella mostra l'importo nel formato svizzero italiano. Il comparatore usa i centesimi interi della riga, così 8 franchi precedono 120 franchi indipendentemente da simboli, separatori e spazi usati per la visualizzazione.

```tsx
import { CurrencyCHF, DataTable, type DataColumn } from "alpina-ui"

type Invoice = { id: string; cents: number }

const columns: DataColumn<Invoice>[] = [
  { id: "id", header: "Fattura", cell: row => row.id },
  {
    id: "amount", header: "Importo", align: "end",
    cell: row => <CurrencyCHF amount={row.cents / 100} locale="it-CH" />,
    compare: (a, b) => a.cents - b.cents,
  },
]

export function Invoices({ rows }: { rows: readonly Invoice[] }) {
  return (
    <DataTable rows={rows} columns={columns} rowKey={row => row.id}
      caption="Fatture del trimestre" empty="Nessuna fattura nel trimestre."
      defaultSort={{ column: "amount", direction: "ascending" }} />
  )
}
```

| Proprietà di `DataTableProps<Row>` | Comportamento |
| --- | --- |
| `rows: readonly Row[]` | Conserva l'ordine iniziale finché manca un ordinamento. Ordina una copia e mantiene l'ordine originale delle righe equivalenti. |
| `columns: readonly DataColumn<Row>[]` | Ogni colonna richiede un `id` univoco, un `header` testuale e `cell(row): ReactNode`. `align` accetta `start` o `end`. `compare(a, b)` abilita l'ordinamento e restituisce un numero negativo, zero o un numero positivo. |
| `rowKey(row): Key` | Restituisce una chiave React stabile e univoca, per esempio l'identificativo della fattura. |
| `caption: string`, `empty: ReactNode` | La didascalia identifica la tabella e la regione scorrevole. Il messaggio vuoto occupa tutte le colonne. |
| `defaultSort?: DataSort` | Se la tabella gestisce il proprio stato, imposta l'ordinamento iniziale con `{ column, direction }`. `column` deve essere l'ID di una colonna ordinabile. |
| `sort?: DataSort \| null`, `onSortChange?(next: DataSort)` | Per controllare l'ordinamento, passa `sort` e aggiorna il valore nel callback. `null` conserva l'ordine delle righe fornite. Il callback riceve anche i cambiamenti della modalità non controllata. |

Le direzioni sono `ascending` e `descending`. Il primo clic su una nuova colonna la ordina in senso crescente. Le attivazioni successive alternano le due direzioni. Invio e Spazio attivano i pulsanti delle intestazioni. L'intestazione attiva espone `aria-sort` e le frecce visive sono decorative.

### Una scheda con tabella e paginazione

```tsx
import {
  Badge, Card, CardContent, CardFooter, CardHeader, CardTitle, Pagination,
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "alpina-ui"

export function Reservations() {
  return (
    <Card>
      <CardHeader><CardTitle>Prenotazioni</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Partenze di sabato</TableCaption>
          <TableHeader><TableRow><TableHead>Tratta</TableHead><TableHead>Stato</TableHead></TableRow></TableHeader>
          <TableBody><TableRow>
            <TableHead scope="row">Lugano – Locarno</TableHead>
            <TableCell><Badge tone="success">Confermata</Badge></TableCell>
          </TableRow></TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Pagination label="Pagine delle prenotazioni" currentPage={1} items={[
          { page: 1, href: "?pagina=1", accessibleLabel: "Pagina 1" },
          { page: 2, href: "?pagina=2", accessibleLabel: "Pagina 2" },
        ]} />
      </CardFooter>
    </Card>
  )
}
```

## Tastiera e tecnologie assistive

- In un gruppo di radio le frecce spostano la scelta. La barra spaziatrice attiva un interruttore o una casella. Il browser applica questi comportamenti ai controlli nativi.
- Per etichettare un controllo singolo usa Field o un elemento `label` associato. Per i radio usa la legenda del gruppo. Traduci etichette, messaggi e nomi delle aree di navigazione nella lingua dell'interfaccia.
- Spinner e Skeleton rispettano `prefers-reduced-motion`. Indica l'esito di un'operazione anche con testo leggibile.
- Verifica il contrasto di testo, bordi e indicatori di focus se personalizzi i colori del tema. Prova il percorso completo del modulo con la sola tastiera, inclusa la correzione degli errori.