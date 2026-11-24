# Componenti interattivi

Questi componenti React usano le etichette fornite dall'applicazione. Passa testi nella lingua dell'interfaccia anche a `label`, `triggerLabel` e `closeLabel`. Ogni componente accetta `className`.

## Finestre e pannelli

`Dialog` apre una finestra centrale. `Sheet` apre un pannello laterale con la stessa API. Il loro elemento HTML `dialog` usa `showModal()` dopo il montaggio. Il browser rende inerte il resto della pagina e gestisce il ritorno del focus al controllo che ha aperto la finestra. [Specifica HTML di dialog](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)

| Proprietà | Uso |
| --- | --- |
| `title: ReactNode` | Titolo visibile e nome accessibile della finestra. |
| `closeLabel: string` | Nome accessibile del pulsante ×. |
| `description?: ReactNode` | Breve descrizione associata via `aria-describedby`. Inserisci contenuto strutturato o lungo nei figli. |
| `trigger?: ReactNode` | Contenuto del pulsante di apertura. Passa testo o un'icona. Il componente crea il pulsante. |
| `triggerLabel?: string` | Nome accessibile per un pulsante di apertura con la sola icona. |
| `children?: ReactNode` | Contenuto della finestra. |
| `open?`, `defaultOpen?`, `onOpenChange?(open: boolean)` | Passa `open` e il callback per gestire lo stato dall'applicazione. Usa `defaultOpen` per inizializzare lo stato interno. |
| `side?: "start" \| "end"` | Lato logico del pannello `Sheet`. Il valore predefinito è `end`. |

Esc, × e un clic sullo sfondo richiedono la chiusura. Un trascinamento iniziato dentro la finestra conserva il contenuto aperto. Per un modulo che necessita di un punto di ingresso preciso, assegna `autoFocus` al campo iniziale e verifica l'ordine di lettura.

```tsx
import { useState } from "react";
import { Dialog } from "alpina-ui/interactive/dialog";
import { Toast } from "alpina-ui/interactive/toast";

export function Preferenze() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} trigger="Modifica sede"
        title="Sede preferita" closeLabel="Chiudi" description="Scegli la sede da proporre nei nuovi moduli.">
        <form onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          localStorage.setItem("sede", String(form.get("sede")));
          setOpen(false);
          setSaved(true);
        }}>
          <label>Sede <select name="sede" defaultValue="Lugano">
            <option>Lugano</option><option>Berna</option>
          </select></label>
          <button type="submit">Salva</button>
        </form>
      </Dialog>
      <Toast open={saved} onOpenChange={setSaved} tone="success" closeLabel="Chiudi conferma">
        Sede preferita salvata.
      </Toast>
    </>
  );
}
```

## Schede e sezioni espandibili

Assegna un identificatore `value` univoco e stabile a ogni elemento. I pannelli restano montati durante la navigazione e mantengono lo stato locale.

| Componente | API |
| --- | --- |
| `Tabs` | `label: string`, `items: { value, label, content, disabled? }[]`, `value?: string`, `defaultValue?: string`, `onValueChange?(value: string)`, `orientation?: "horizontal" \| "vertical"`. `label` e `content` di ogni voce accettano nodi React. |
| `Accordion` | `items: { value, title, content, disabled? }[]`, `value?: string \| null`, `defaultValue?: string \| null`, `onValueChange?(value: string \| null)`, `headingLevel?: 2 \| 3 \| 4 \| 5 \| 6`. `title` e `content` accettano nodi React. |

`Tabs` attiva la scheda raggiunta con le frecce orizzontali o verticali, secondo l'orientamento. Home ed End raggiungono gli estremi, saltando le voci disabilitate. Tab entra attraverso la scheda selezionata e prosegue verso il pannello. Quando la selezione esce dalla lista, viene mostrata la prima scheda attiva. [Pattern WAI-ARIA Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

`Accordion` espande una sezione alla volta. Invio o Spazio aprono e richiudono la sezione. Freccia su e giù, Home ed End spostano il focus tra le intestazioni. Il valore `null` richiude tutte le sezioni. Regola `headingLevel` secondo la struttura della pagina.

```tsx
<Tabs label="Sedi" defaultValue="be" items={[
  { value: "be", label: "Berna", content: <p>Bundesplatz, Berna</p> },
  { value: "ti", label: "Lugano", content: <p>Piazza della Riforma, Lugano</p> },
]} />
```

## Menu di azioni

`DropdownMenu` accetta `label` e un array `items`. Ogni voce richiede un identificatore stabile `value` e un testo `label`. Con più menu nella stessa pagina, usa `triggerLabel` per includere nel nome accessibile il contatto a cui si riferiscono le azioni. `open`, `defaultOpen` e `onOpenChange` consentono di controllare l’apertura. All’attivazione, il menu chiude e restituisce il focus al pulsante. Esegue prima `onSelect()` della voce e poi `onValueSelect(value)` del menu.

| Opzione | Effetto |
| --- | --- |
| `align` | Allinea il pannello al lato logico del pulsante, tenendo conto della direzione del testo. La posizione si adatta allo spazio disponibile. Accetta `start` ed `end`. Il valore iniziale è `start`. |
| `size="compact"` | Riduce l’altezza del pulsante da 44 a 32 px con puntatore preciso, con la scala predefinita. Con puntatore primario touch il bersaglio misura almeno 44 × 44 px. Il valore iniziale è `regular`. |
| `item.separatorBefore` | Inserisce un divisore prima della voce e mantiene la navigazione continua da tastiera. Un divisore prima della prima voce viene omesso. |
| `item.tone="danger"` | Abbina il rosso a un segno meno cerchiato e al peso del carattere. Assegna comunque un nome esplicito all’azione. |
| `item.disabled` | Lascia la voce esplorabile con le frecce e impedisce l’attivazione. |

Invio, Spazio e Freccia giù aprono la prima voce. Freccia su apre l’ultima e la porta nella porzione visibile del menu. Frecce, Home, End e le iniziali del nome spostano il focus. Esc torna al pulsante e Tab prosegue verso il controllo successivo. Se il pulsante esce completamente da un pannello scorrevole, il menu si chiude. Nei browser con Popover API il pannello usa il livello superiore del documento per oltrepassare il ritaglio del contenitore. [Pattern WAI-ARIA Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

```tsx
<DropdownMenu
  label="Azioni"
  triggerLabel={`Azioni per ${contact.name}`}
  align="end"
  size="compact"
  items={[
    { value: "edit", label: "Modifica contatto", onSelect: editContact },
    {
      value: "remove",
      label: "Elimina contatto…",
      separatorBefore: true,
      tone: "danger",
      onSelect: openDeleteConfirmation,
    },
  ]}
/>
```

## Messaggi e suggerimenti

| Componente | API e comportamento |
| --- | --- |
| `Toast` | Richiede `open: boolean`, `onOpenChange(open: boolean)`, `closeLabel: string` e `children: ReactNode`. `tone` accetta `neutral`, `success` e `danger`. `urgency` accetta `polite` o `assertive`. |
| `Tooltip` | Richiede `content: string` e come unico figlio un controllo raggiungibile da tastiera che inoltri `aria-describedby` al DOM. Il suggerimento conserva gli ID descrittivi già presenti. |

Mantieni `Toast` montato e cambia `open` per visualizzarlo. La regione live resta presente tra un annuncio e il successivo. Il messaggio resta visibile fino alla chiusura e conserva il focus sul flusso principale. Puoi collocarlo accanto all'azione che l'ha generato.

`Tooltip` appare al passaggio del puntatore o quando il controllo riceve il focus e si chiude con Esc. Usa il testo del suggerimento per dettagli supplementari e dai all'azione un nome comprensibile anche su touchscreen.

```tsx
<Tooltip content="Apre il manuale in italiano">
  <button type="button" onClick={openManual}>Guida</button>
</Tooltip>
```

## Verifica nel browser

Dalla directory del progetto, dopo `npm ci`, esegui `node tests/interactive.browser.mjs`. Lo script usa Chromium di Playwright quando disponibile, altrimenti Chrome installato. Per scegliere il browser imposta `CHROME_PATH` al suo eseguibile. La suite avvia React in Strict Mode e simula interazioni con i sette componenti in una viewport larga 390 px.