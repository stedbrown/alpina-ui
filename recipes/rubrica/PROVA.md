# Prova di adozione dal portale

## Condizioni

Ho creato un progetto React e TypeScript vuoto, aperto il catalogo HTML 0.4 in Chrome senza rete e scaricato il pacchetto dalla pagina **Installazione**. Le uniche informazioni usate su Alpina provengono da pagine effettivamente renderizzate del portale. La toolchain locale fornisce il compilatore, il bundler e il browser di prova. Non ho usato la Rubrica clienti dimostrativa del portale come sorgente.

Per la composizione ho consultato le guide Avvio rapido, Misure e griglia, Fondamenti e Formati svizzeri. Le schede API e Codice di Grid, Item, ToggleGroup, Field, Input, Select, DropdownMenu, Sheet, AlertDialog, Typography ed Empty coprono il percorso principale. La firma di SwissAddressForm documenta i valori iniziali e il salvataggio. La guida sui formati spiega che cambiare lingua conserva i valori della bozza.

## Prima misura, Alpina 0.4

Il CSS dell’applicazione comprende 20 blocchi di regole, 56 dichiarazioni e 101 righe con la formattazione del progetto. I numeri contano solo `src/rubrica.css`. Non ci sono stili inline né selettori sulle classi interne della libreria. Alcune regole esprimono la direzione grafica scelta per questa rubrica e sono facoltative per un altro progetto.

| Parte della rubrica | Dove compare il CSS | Motivo |
| --- | --- | --- |
| Composizione dei controlli | Regola condivisa di mast-line, opening e section-line | Quattro istanze affiancano elementi di natura diversa, con ritorno a capo e allineamento alla linea di base. Una regola da cinque dichiarazioni copre tutte le istanze. |
| Pannello di modifica | editor-body | Disponi lingua e modulo in verticale con uno spazio tra i due. |
| Ricerca, cantone e ordinamento | search-tools | Il filtro deve ospitare tre campi e ridistribuirli a seconda dello spazio. La griglia intrinseca sceglie il numero di colonne. |
| Riga corrente | index-list li e relativo data-current | Mantieni la posizione del contenuto fra riga corrente e non corrente e associa al record aperto un tratto rosso. L’indicazione semantica è sul collegamento corrente. |
| Intestazione, numero di registro, scheda postale | directory-title, record-folio, record-body, record address, record-canton | Gerarchia specifica dell’applicazione. Il numero di registro rimane fisso anche quando l’elenco viene riordinato. |
| Testo tedesco | directory-title | Con una finestra da 320 px il titolo tedesco generava una pagina larga 357 px. Con sillabazione e ritorno a capo la misura è tornata a 320 px. |

La griglia a colonne, i controlli, l’errore di validazione, il pannello, la conferma di eliminazione e la tastiera del menu funzionano usando gli stili della libreria. Nell’indice, `Item` riceve il progressivo in `leading`, nome e località e il vero menu in `trailing`.

## Contratti che richiedono lavoro applicativo

Il filtro per cantone mostra solo i cantoni presenti nei dati e include un’opzione «Tutti» selezionabile. In 0.4 il placeholder di CantonSelect è disabilitato. La rubrica combina Select e il dataset cantonale pubblico che il portale descrive. La localizzazione dei toponimi nei dati di contatto conserva gli indirizzi postali originali.

Nel menu 0.4 le azioni Modifica ed Elimina hanno lo stesso trattamento. Per distinguere l’eliminazione la rubrica apre un AlertDialog con un testo che identifica il contatto. Per tornare al trigger dopo l’annullamento, la prima implementazione individuava il pulsante del menu grazie al suo attributo ARIA nel record.

## Verifiche riproducibili

### Seconda implementazione con il portale 0.5

Ho ripetuto il download dalla pagina Installazione del nuovo portale, consultato le schede API di Stack, Item, Typography e DropdownMenu e applicato la guida Rubrica bilingue. Ho mantenuto gli stessi dati, flussi e scelte editoriali. Nel foglio della rubrica restano **16 regole, 43 dichiarazioni e 78 righe**. Il confronto con le 56 dichiarazioni iniziali dà una riduzione di **13 dichiarazioni, pari al 23,2%**.

| Miglioramento verificato | Delta nel CSS dell’applicazione |
| --- | ---: |
| Quattro barre usano Stack orizzontale con allineamento alla linea di base, ritorno a capo e due intervalli. Lo stesso componente dispone in colonna lingua e modulo nel pannello di modifica. | −8 dichiarazioni |
| Item current segnala il contatto aperto e conserva l’allineamento del testo nelle altre righe. Il collegamento espone ancora aria-current. | −3 dichiarazioni |
| Typography gestisce sillabazione e rientro per «Atelierverzeichnis». Senza le due regole locali il browser misura ancora 320 px a una finestra larga 320 px. | −2 dichiarazioni |

Il nuovo menu usa la variante compatta e l’allineamento finale sul pulsante. Un separatore precede Elimina e il trattamento distruttivo la distingue da Modifica. AlertDialog mantiene la conferma; triggerRef permette di ripristinare il focus sul comando corretto senza query sul DOM. Per il filtro cantonale ho mantenuto Select con i soli cantoni presenti nei dati. L’opzione allLabel di CantonSelect è utile per un filtro su tutti i 26.

**Il CSS che resta.** La griglia intrinseca dei tre filtri usa quattro dichiarazioni, compresa la spaziatura verticale. L’elenco HTML usa tre dichiarazioni per togliere marker e rientri del browser mantenendo la semantica. Le altre 36 riguardano impaginazione e identità della rubrica: larghezza del foglio, margini, filetti, gerarchia del titolo e della scheda, numero di registro e recapito postale. Il testo digitato, gli stati di validazione, il menu e il dialogo di conferma funzionano con gli stili della libreria.

Il progetto include `evidence/baseline-0.4.css` e i conteggi dettagliati prima e dopo. Le misure escludono il CSS interno della dipendenza. Cinque istanze di Stack spostano la decisione di layout nel JSX tramite proprietà pubbliche. La riduzione misura il CSS dell’applicazione, non il peso dell’intera pagina compilata.

### Test

`npm test` percorre ricerca senza accenti, filtro, ordinamento, selezione, errori, creazione, modifica, annullamento ed eliminazione. Verifica anche la lingua della pagina, la bozza di un modulo, il focus e l’assenza di dati dei contatti in localStorage. L’HTML è stato aperto con il browser offline. Il comando `node scripts/css-count.mjs` restituisce conteggio e dettaglio per selettore.

A 320, 390, 768 e 1440 px la pagina è stata provata in entrambe le lingue. Per la versione 0.4 le scansioni automatiche di lista, menu aperto, pannello di modifica e conferma in IT/DE a 320 e 1440 px hanno restituito zero violazioni rilevate in 16 stati.

Anche nella versione 0.5 tutti i test funzionali sono passati. Ho ripetuto le 16 scansioni automatiche senza violazioni rilevate. A 320 px, nel caso provato, il menu finale occupa 192 px e il suo bordo sinistro è a 96 px: le due azioni restano nel viewport.
