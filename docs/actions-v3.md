# Comandi, selezione e pannelli

Una voce di menu esegue un’azione. Una combobox sceglie un valore da trasmettere al modulo. Un pannello modale sospende il lavoro sottostante finché l’utente lo chiude. Le tre interazioni hanno gesti e convenzioni di focus differenti. [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/)

## Ricerca e comandi

**Combobox** richiede `label`, `options` ed `empty`. Ogni opzione ha un identificatore univoco `value`, un nome `label` ed eventuali `detail`, `keywords` e `disabled`. La ricerca considera accenti e parole chiave. Le frecce scorrono i risultati abilitati, Invio conferma, Esc ripristina il testo della scelta precedente. Anche Tab conserva l’ultima scelta confermata. `name` include l’identificatore nel modulo, `required` e `requiredMessage` gestiscono la validazione. `value/onValueChange` abilitano il controllo esterno. [Pattern Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

**Command** raccoglie azioni con la stessa struttura di ricerca dentro un dialogo. Passa `title`, `trigger`, `closeLabel`, `searchLabel`, `empty` e `items`. Aggiungi `onSelect` alla singola voce oppure ricevi il suo identificatore in `onValueSelect`. La ricerca riceve il focus all’apertura. Le frecce cambiano la voce attiva. Invio esegue l’azione. L’applicazione può aprire il dialogo tramite `open/onOpenChange` per collegarlo a una scorciatoia.

**ContextMenu** associa `items` a un contenuto `children` con un nome `label`. Si apre con il pulsante secondario o Maiusc + F10. **Menubar** prende `label` e `menus`, ciascuno con `value`, `label` e `items`. Le frecce orizzontali cambiano gruppo. Le verticali scorrono le azioni. Home, Fine e la ricerca per prefisso spostano il focus. Le voci disabilitate restano leggibili ed escludono l’attivazione. Esc ritorna al controllo di partenza. [Pattern Menu e Menubar](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)

## Anteprime e decisioni

**AlertDialog** richiede `title`, `description`, `cancelLabel`, `confirmLabel` e `onConfirm`. La prima azione focalizzata è quella di annullamento. Esc annulla, un clic sullo sfondo lascia aperta la conferma. L’applicazione esegue l’operazione in `onConfirm`. Usa un dialogo controllato per rappresentare operazioni asincrone e relativi errori. [Pattern Alert Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)

**Drawer** condivide titolo, descrizione, contenuto, piè di pagina e controllo di apertura con Dialog. Si apre dal bordo inferiore. Il maniglione accetta il trascinamento verso il basso, il pulsante `closeLabel` e il tasto Esc chiudono da tastiera. `swipeToClose={false}` rimuove il maniglione. **Dialog** e **Sheet** accettano `initialFocusRef` e `footer`. La dimensione è regolabile con `size="compact" | "regular" | "wide"`. La proprietà `side` di Sheet segue la direzione di lettura. [Pattern Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

**Popover** apre da `trigger` un pannello non modale con `title`, `closeLabel` e `children`. Il focus passa al pannello, Tab attraversa i controlli e può uscire. Esc ritorna al pulsante. **HoverCard** associa una breve anteprima a un termine. Richiede `trigger`, `title` e `children`. Il focus rivela subito il testo, il puntatore attende `delay` millisecondi e un tocco fissa la scheda. Un secondo tocco, Esc o l’uscita dal gruppo la chiudono. **Tooltip** usa lo stesso intervallo di attraversamento tra attivatore e testo. Il suo contenuto è una stringa e viene collegato con `aria-describedby`.

## Spazio e navigazione

**Resizable** divide due contenuti `first` e `second`. Assegna al separatore un nome `label` che identifichi il primo pannello. `min`, `max`, `defaultValue` e `value` sono percentuali dello spazio utile. Trascina il separatore oppure usa le frecce lungo l’asse. Maiusc moltiplica il passo per cinque. Home e Fine raggiungono i limiti, Invio alterna il minimo e l’ultima dimensione. `orientation="vertical"` dispone i pannelli uno sopra l’altro. [Pattern Window Splitter](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)

**Carousel** espone una serie manuale con `items`, ciascuno con `value`, `label` e `content`. I nomi dei pulsanti vengono da `previousLabel` e `nextLabel`. La posizione e il nome del campione vengono annunciati al cambio. Su schermi tattili uno scorrimento orizzontale cambia scheda. Da tastiera si usano i pulsanti, oppure le frecce quando il focus è sulla regione. [Pattern Carousel](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)

**Tabs** offre `activation="manual"` per pannelli onerosi. Le frecce spostano il focus, Invio o Spazio attivano il pannello. **Accordion** consente di mantenere una sezione aperta con `collapsible={false}`. **Toast** resta leggibile fino alla chiusura, salvo impostare `duration` in millisecondi. Il conto alla rovescia si sospende mentre il puntatore o il focus sono sull’avviso e quando la pagina è nascosta.
