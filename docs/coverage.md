# Corrispondenza con shadcn/ui

Il 24 novembre 2026 la sezione **All Components** di shadcn/ui comprendeva 66 famiglie. Il registro di Alpina UI 0.5.0 comprende 78 voci installabili. Per ognuno dei 66 nomi esiste una voce Alpina dedicata. Il confronto riguarda questo indice pubblico. Le sezioni AI Elements, Blocks, Charts e i registri della community hanno inventari distinti. [Indice ufficiale dei componenti](https://ui.shadcn.com/docs/components)

## Differenze da considerare nella scelta

| Famiglia | Comportamento documentato |
| --- | --- |
| Attachment | La voce Alpina espone un collegamento a un file con nome e metadati. Shadcn compone anche anteprime dei media, avanzamento del caricamento e azioni indipendenti. [Attachment di shadcn](https://ui.shadcn.com/docs/components/base/attachment) |
| Bubble | In Alpina un contenitore dispone il contenuto sul lato iniziale o finale della conversazione. Shadcn documenta anche gruppi di fumetti, reazioni e testo richiudibile. [Bubble di shadcn](https://ui.shadcn.com/docs/components/base/bubble) |
| Marker | In Alpina un segno accanto al testo distingue tre stati. Shadcn usa la famiglia anche per note di sistema, righe bordate e separatori etichettati all’interno di una conversazione. [Marker di shadcn](https://ui.shadcn.com/docs/components/base/marker) |
| Message | Alpina compone un articolo con autore, orario facoltativo e fumetto. In shadcn avatar, intestazione, piè di messaggio e allineamento si compongono con parti dedicate. [Message di shadcn](https://ui.shadcn.com/docs/components/base/message) |
| Message Scroller | Alpina segue i nuovi messaggi e offre il ritorno in fondo a chi sta rileggendo lo storico. Shadcn documenta anche ancoraggio per turno, ripristino di trascrizioni, aggiunta di storico in cima e salto a un messaggio preciso. [Message Scroller di shadcn](https://ui.shadcn.com/docs/components/base/message-scroller) |
| Questionnaire | Alpina gestisce una sequenza di domande a risposta singola obbligatoria con revisione e invio. Shadcn include anche selezione multipla, risposta libera e domande saltabili. [Questionnaire di shadcn](https://ui.shadcn.com/docs/components/base/questionnaire) |
| Trace | Alpina espone una cronologia ordinata di eventi con orario e dettaglio espandibile. Le parti della Trace di shadcn si compongono anche in chiamate a strumenti, fonti e aggiornamenti progressivi di un agente. [Trace di shadcn](https://ui.shadcn.com/docs/components/base/trace) |
| Code Block | Alpina mostra e copia una stringa con intestazione. Shadcn documenta anche numerazione delle righe, resa di differenze fra versioni e output di terminale. [Code Block di shadcn](https://ui.shadcn.com/docs/components/base/code-block) |
| Chart | Alpina traccia barre per valori positivi e negativi e mette a disposizione la tabella sottostante. L’integrazione Recharts di shadcn offre più famiglie di grafici. [Chart di shadcn](https://ui.shadcn.com/docs/components/base/chart) |
| Data Table | Il componente Alpina ordina righe e accetta celle personalizzate. La guida di shadcn costruisce una tabella con TanStack Table e tratta anche filtri, paginazione e visibilità delle colonne. [Data Table di shadcn](https://ui.shadcn.com/docs/components/base/data-table) |
| Calendar e Date Picker | Alpina sceglie una data civile per volta nelle quattro lingue nazionali e garantisce il formato ISO del valore. La documentazione di shadcn include la selezione di intervalli. [Calendar di shadcn](https://ui.shadcn.com/docs/components/base/calendar) |
| Select e Native Select | In Alpina entrambi conservano l’elemento HTML `select` e il selettore del dispositivo. La famiglia Select di shadcn descrive un controllo composto con pulsante di apertura e lista. [Select di shadcn](https://ui.shadcn.com/docs/components/base/select) |
| Slider | Alpina usa un cursore HTML a un valore. Shadcn documenta anche uno slider con più maniglie. [Slider di shadcn](https://ui.shadcn.com/docs/components/base/slider) |

Le API sono specifiche di ciascuna libreria. Per stimare una migrazione contano le proprietà, gli stati e la resa effettivamente utilizzati nel proprio prodotto.

## Indice dei 66 nomi

La colonna «Voce Alpina» contiene l’identificatore accettato dal comando `alpina add`. L’export è il nome importabile da `alpina-ui`.

| Componente shadcn | Voce Alpina | Export | Cartella |
| --- | --- | --- | --- |
| Accordion | `accordion` | `Accordion` | interactive |
| Alert | `alert` | `Alert` | ui |
| Alert Dialog | `alert-dialog` | `AlertDialog` | interactive |
| Aspect Ratio | `aspect-ratio` | `AspectRatio` | ui |
| Attachment | `attachment` | `Attachment` | ui |
| Avatar | `avatar` | `Avatar` | ui |
| Badge | `badge` | `Badge` | ui |
| Breadcrumb | `breadcrumb` | `Breadcrumb` | ui |
| Bubble | `bubble` | `Bubble` | ui |
| Button | `button` | `Button` | ui |
| Button Group | `button-group` | `ButtonGroup` | ui |
| Calendar | `calendar` | `Calendar` | swiss |
| Card | `card` | `Card` | ui |
| Carousel | `carousel` | `Carousel` | interactive |
| Chart | `chart` | `Chart` | ui |
| Checkbox | `checkbox` | `Checkbox` | ui |
| Code Block | `code-block` | `CodeBlock` | portal |
| Collapsible | `collapsible` | `Collapsible` | ui |
| Combobox | `combobox` | `Combobox` | interactive |
| Command | `command` | `Command` | interactive |
| Context Menu | `context-menu` | `ContextMenu` | interactive |
| Data Table | `data-table` | `DataTable` | ui |
| Date Picker | `date-picker` | `DatePicker` | swiss |
| Dialog | `dialog` | `Dialog` | interactive |
| Direction | `direction` | `Direction` | ui |
| Drawer | `drawer` | `Drawer` | interactive |
| Dropdown Menu | `dropdown-menu` | `DropdownMenu` | interactive |
| Empty | `empty` | `Empty` | ui |
| Field | `field` | `Field` | ui |
| Hover Card | `hover-card` | `HoverCard` | interactive |
| Input | `input` | `Input` | ui |
| Input Group | `input-group` | `InputGroup` | ui |
| Input OTP | `input-otp` | `InputOTP` | interactive |
| Item | `item` | `Item` | ui |
| Kbd | `kbd` | `Kbd` | ui |
| Label | `label` | `Label` | ui |
| Marker | `marker` | `Marker` | ui |
| Menubar | `menubar` | `Menubar` | interactive |
| Message | `message` | `Message` | ui |
| Message Scroller | `message-scroller` | `MessageScroller` | interactive |
| Native Select | `native-select` | `NativeSelect` | interactive |
| Navigation Menu | `navigation-menu` | `NavigationMenu` | portal |
| Pagination | `pagination` | `Pagination` | ui |
| Popover | `popover` | `Popover` | interactive |
| Progress | `progress` | `Progress` | ui |
| Questionnaire | `questionnaire` | `Questionnaire` | interactive |
| Radio Group | `radio-group` | `RadioGroup` | ui |
| Resizable | `resizable` | `Resizable` | interactive |
| Scroll Area | `scroll-area` | `ScrollArea` | ui |
| Select | `select` | `Select` | ui |
| Separator | `separator` | `Separator` | ui |
| Sheet | `sheet` | `Sheet` | interactive |
| Sidebar | `sidebar` | `Sidebar` | portal |
| Skeleton | `skeleton` | `Skeleton` | ui |
| Slider | `slider` | `Slider` | ui |
| Spinner | `spinner` | `Spinner` | ui |
| Switch | `switch` | `Switch` | ui |
| Table | `table` | `Table` | ui |
| Tabs | `tabs` | `Tabs` | interactive |
| Textarea | `textarea` | `Textarea` | ui |
| Toast | `toast` | `Toast` | interactive |
| Toggle | `toggle` | `Toggle` | ui |
| Toggle Group | `toggle-group` | `ToggleGroup` | interactive |
| Tooltip | `tooltip` | `Tooltip` | interactive |
| Trace | `trace` | `Trace` | interactive |
| Typography | `typography` | `Typography` | ui |

## Le altre 12 voci di Alpina

| Uso | Voci Alpina |
| --- | --- |
| Composizione e portale | `app-shell`, `grid`, `stack`, `prose`, `text-link` |
| Lingua, cantoni e indirizzi | `canton-combobox`, `canton-select`, `locale-select`, `swiss-address-form`, `swiss-postal-code-input` |
| Formati | `currency-chf`, `swiss-date` |

Il controllo `node --test tests/coverage.test.mjs` confronta questa fotografia documentale con le voci del registro e gli export del pacchetto compilato. Per una nuova rilevazione occorre ricontare l’indice pubblicato da shadcn.