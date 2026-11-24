# Tipografia e componenti di base

Il margine di una colonna serve a ritrovare un’informazione quando cambia il contenuto. Nell’indice di Alpina, titoli lunghi possono andare a capo mentre le quantità in fondo alla riga mantengono il proprio asse. Nei moduli, etichetta, controllo e spiegazione iniziano sulla stessa verticale.

## Dal manifesto allo schermo

Nella serie _Musica Viva_ di Josef Müller-Brockmann, la composizione cambia fra i manifesti del 1958 e del 1960. Proporzioni e raggruppamenti permettono di distinguere interpreti, programma e sede. Nel manifesto _Stadttheater Basel, Saison 60/61_ di Armin Hofmann la grande «t» comprende un’area su cui applicare il programma settimanale. Una struttura stabile può quindi ospitare informazione variabile, anche in un supporto stampato. [Poster House, The Swiss Grid](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Poster House, Stadttheater Basel](https://collection.posterhouse.org/poster/stadttheater-basel-saison-60-61/)

In _Giselle_ (1959) il contrasto tra il nome leggibile e il mosso della ballerina dà due tempi di lettura. I piccoli dettagli hanno un peso altrettanto concreto. Il tratto superiore del numero uno supera il margine per allinearne il fusto al testo vicino. In Alpina l’inizio degli elementi di testo resta comune, mentre un simbolo di stato occupa una colonna propria. [MoMA, Giselle](https://www.moma.org/collection/works/6775/) · [Poster House, lettura dell’opera](https://access.posterhouse.org/exhibition/swiss-grid-2/)

## Misure digitali

Per le colonne numeriche c’è un precedente preciso. Nel manifesto *Ausstellung Musikinstrumente* (1962), Richard Paul Lohse allinea alla griglia il margine destro delle ore di apertura. Alpina riprende questo criterio in tabella, dove si devono confrontare gli importi scorrendo la colonna. [Poster House, opera e lettura degli orari](https://access.posterhouse.org/exhibition/swiss-grid-2/)

Il modulo di Alpina vale `0.25rem`, cioè 4 px con la radice del browser a 16 px. È una scelta per questa libreria. Le opere storiche citate attestano un metodo compositivo, senza prescrivere misure CSS. Le interlinee predefinite sono 16, 20, 24, 28 e 48 px. Un corpo di 14 px resta sulla linea di 20 px. Bordi sottili e sagome dei glifi possono tagliare il modulo.

- `GridItem` accetta `start={{ small: 1, medium: 2, large: 3 }}` insieme alle ampiezze `small`, `medium` e `large`. L’inizio si ferma all’ultima colonna che può contenere l’elemento. Le soglie dipendono dalla larghezza del contenitore.
- `Typography measure="reading"` limita il testo a 65ch, `measure="narrow"` a 44ch. La misura in ch si basa sullo zero del carattere, quindi il numero effettivo di lettere per riga varia.
- `TableHead numeric` e `TableCell numeric` allineano i dati sul margine finale e attivano le cifre tabellari disponibili nel carattere. `Input numeric` dispone una quantità sullo stesso asse e richiede il tastierino decimale. La convalida dipende dal tipo di campo.
- Con `Chart` lo zero è comune a tutte le barre. I valori negativi occupano il lato opposto e usano un tratteggio. La tabella apribile contiene categoria e valore. Per localizzare cifre o unità, passare `formatValue`. Le osservazioni non finite sono escluse e un insieme vuoto mostra `emptyLabel`.
- `Alert`, `Badge` e `Marker` abbinano segni e testo. «Archiviato» o «Da verificare» comunica il significato anche quando i colori sono sostituiti dal sistema. Dare a ogni controllo un’etichetta nella lingua di chi lo usa.

## Comporre una pagina

### Ingombri e superfici attive

Queste misure assumono una radice di 16 px. Le dimensioni espresse in rem seguono le preferenze tipografiche del browser. L’altezza minima permette al testo di occupare una seconda riga.

| Elemento          | Misura e motivazione                                                                                                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Pulsante          | Le taglie sm, md e lg partono da 32, 44 e 48 px. Su un dispositivo con puntatore impreciso sm sale a 44 px. Toggle e il controllo del cursore riservano almeno 44 px in altezza.           |
| Checkbox e switch | La checkbox separa un segno di 20 px dall’area attiva di 24 px, che si estende a 44 px con puntatore impreciso. Lo switch è largo 48 px e alto 32 px, con area attiva alta 44 px su touch. |
| Testo nella riga  | Item dispone i contenuti con intervalli di 8 o 12 px. Date e conteggi hanno cifre tabellari. Su una riga corta i metadati si spostano sotto il titolo.                                     |
| Avatar e tasto    | Avatar offre lati da 32, 40 e 56 px. Kbd ha una dimensione minima di 24 px e si allarga per un nome come «Invio».                                                                          |
| Focus             | I controlli personalizzati mostrano un contorno di 2 px. Le zone scorrevoli disegnano l’indicatore all’interno, così il contenitore non lo ritaglia.                                       |

Il test browser misura il contrasto di testo, etichette, stati e contorni su campioni dei temi chiaro e scuro, compreso il tema applicato a un contenitore annidato. Verifica in modo indipendente lo stato premuto con i colori forzati e l’interazione con la sola tastiera. Le soglie di verifica sono 4,5 a 1 per il testo ordinario e 3 a 1 per gli indicatori grafici. [W3C, contrasto del testo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [W3C, contrasto non testuale](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

### Scelta dei componenti

| Esigenza               | Componenti e comportamento                                                                                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Elenco di opere        | `Item` riceve titolo, descrizione e metadati. Un link nel titolo offre la navigazione nativa. `Empty` descrive un insieme vuoto e accetta un’azione.                                                                                                               |
| Tavola e campione      | `AspectRatio` stabilizza le proporzioni del supporto. `Attachment` presenta un file con un vero collegamento che può ricevere `download`.                                                                                                                          |
| Valore e unità         | Collegare `Label` al campo con `htmlFor` e `id`. Dentro `InputGroup` un suffisso che determina il significato del valore va associato con `aria-describedby`. `Slider` usa un input range nativo e accetta min, max e step.                                        |
| Azioni correlate       | `ButtonGroup` dà un nome a un gruppo di pulsanti. Ogni pulsante conserva il proprio arresto di tabulazione. `Toggle` espone lo stato tramite `aria-pressed` e mantiene lo stesso nome in entrambe le posizioni.                                                    |
| Messaggistica          | `Avatar` usa le iniziali se l’immagine manca o non si carica. Se il nome è già visibile, usare `decorative`. `Message` associa l’autore all’orario e al testo reso con `Bubble`. `Direction` imposta l’ordine di lettura del contenitore in documenti multilingue. |
| Dettagli e navigazione | `Collapsible` usa details/summary ed è utilizzabile con tastiera. `ScrollArea` è una regione con nome e focus. `Kbd` rappresenta il nome del tasto, mentre il gestore della scorciatoia appartiene all’applicazione.                                               |

## Compatibilità con la serie 0.2

Le proprietà precedenti conservano i loro nomi. Le varianti aggiunte permettono di dichiarare il comportamento nei punti in cui serve.

| Componenti                        | Uso introdotto nella 0.3                                                                                                                                                                                                                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Button, Card                      | `busy` blocca una seconda attivazione e conserva il testo del pulsante. `Card as="article"` dà un contenitore semantico a un elemento autonomo.                                                                                                                                            |
| Checkbox, Switch, RadioGroup      | `indeterminate` espone una selezione parziale anche al controllo nativo. `stateLabels={{ on: 'Attivo', off: 'Sospeso' }}` aggiunge lo stato visibile dello switch. `orientation="horizontal"` permette alle opzioni radio di andare a capo insieme alle etichette.                         |
| Field, Select, Textarea           | Field ricompone gli ID di suggerimento ed errore eliminando i duplicati. `Select placeholder` aggiunge un’opzione vuota anche nei campi obbligatori a scelta singola. `Textarea autoGrow` segue il testo dove il browser supporta field-sizing e mantiene il comportamento nativo altrove. |
| Progress, Skeleton, Spinner       | `formatValue(value, max)` espone l’unità accessibile del progresso. `Skeleton variant="text"` o `"avatar"` riserva uno spazio appropriato. `Spinner size` seleziona un diametro di 16, 20 o 32 px.                                                                                         |
| Breadcrumb, Pagination, Separator | `currentIndex` permette di indicare una tappa intermedia. Pagination contrassegna i link alle pagine adiacenti con prev e next. `Separator weight="section"` dà maggiore enfasi a un cambio di sezione.                                                                                    |
