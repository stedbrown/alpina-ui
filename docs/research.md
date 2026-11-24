# Disegnare con tre inchiostri

## Che cosa rende svizzera un’interfaccia?

Nella ricostruzione del DFAE la grafica svizzera nasce dall’incontro fra scuola, laboratorio tipografico e commissioni reali. A Basilea e Zurigo si insegnava grafica applicata già nel 1915. Negli anni Cinquanta e Sessanta quella cultura diventa riconoscibile fuori dai confini nazionali. Per una libreria digitale il parallelo più fertile è il lavoro in serie. Una bella apertura di catalogo è un singolo caso. Una griglia che continua a funzionare quando cambiano titolo, lingua e quantità di dati è un metodo di progetto. [About Switzerland, storia dello Swiss Style](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

## Il rosso occupa una posizione

In *der Film* di Josef Müller-Brockmann (1960) il titolo attraversa un campo nero. Le informazioni sul luogo e sugli orari sono piccole, rosse e allineate alla F di Film. Il manifesto permette due letture a distanze diverse. Si riconosce il soggetto da lontano e si trovano i dettagli avvicinandosi. Lo stesso asse collega le due operazioni. La scheda dello Smithsonian distingue anche il grigio della parola «der» dal bianco di «Film». [Cooper Hewitt, Smithsonian Design Museum, der Film](https://www.si.edu/object/der-film-film%3Achndm_1999-46-2)

Per Alpina il vincolo è più preciso. Bianco, nero e rosso sono i tre colori pieni. Il campo bianco del portale resta continuo fra il titolo e l’esempio. Il rosso marca la data nel programma, la voce corrente nell’indice e le azioni primarie. In un avviso, la parola che identifica lo stato deve bastare a comprenderlo. Un bordo o un segno può rafforzarla. Se tutto fosse rosso l’accento perderebbe la sua funzione. Qui il vincolo dei tre colori risponde alla direzione artistica scelta per Alpina. Nel manifesto storico ogni autore decideva come usare gli inchiostri.

### Perché questo rosso

Il rosso di Alpina è `#EB0000`. Sul bianco puro il rapporto di contrasto è circa 4,63:1, sul nero puro circa 4,53:1. Lo stesso accento rimane quindi leggibile in entrambi i temi. Un bordo fine fra due superfici usa una mescolanza di bianco e nero. I controlli essenziali hanno contorni più marcati e la selezione dell’indice abbina al colore un tratto verticale e il grassetto. Il visitatore può continuare a usare la palette di sistema quando attiva i colori forzati. Questi rapporti valgono per le coppie piene specificate. [W3C, contrasto minimo e luminanza relativa](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## Una griglia per una serie

Nei manifesti di *Musica Viva*, Müller-Brockmann lavora con una famiglia di composizioni. Nell’esempio del 1958 quattro forme circolari si rapportano a una struttura di tre colonne. L’ordine del programma dà un asse alle informazioni, mentre la figura comunica il carattere della serata. Guardare più di un’edizione aiuta a capire quanta variazione può sostenere uno stesso impianto. [Poster House, Swiss Grid](https://access.posterhouse.org/exhibition/swiss-grid-2/)

Il libro *Designing Programmes* di Karl Gerstner (1964) sviluppa questo problema attraverso quattro saggi. Formulare un programma significa decidere quali relazioni devono tenere e quali parametri possono cambiare. Un’applicazione digitale può rendere osservabile il risultato. Nel campionario Alpina lo stesso elenco di incontri passa attraverso contenitori da 320, 640 e 960 px. Orario, titolo e formato rimangono identificabili. Accendendo la griglia si possono controllare gli assi. Cambiando la larghezza si possono leggere le misure calcolate dal browser. [Lars Müller Publishers, facsimile di Designing Programmes](https://www.lars-mueller-publishers.com/designing-programmes-0)

## Basilea e la correzione ottica

Nel manifesto *Giselle* (1959) Armin Hofmann mette in relazione una figura fotografica in movimento e il contorno nitido delle lettere. Un dettaglio più sottile è l’allineamento ottico del numero 1. La percezione del suo tratto verticale conta quanto il limite geometrico del carattere. Nella stagione 1960–61 dello Stadttheater Basel, una grande lettera ricorrente lascia una zona libera per un programma settimanale variabile. Cambiano i contenuti, si riconosce la stagione. [MoMA, Giselle](https://www.moma.org/collection/works/6775/) · [Poster House, lettura delle opere](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Poster House, Stadttheater Basel](https://collection.posterhouse.org/poster/stadttheater-basel-saison-60-61/)

Le cifre di un orario devono essere confrontabili riga per riga. In Alpina hanno larghezza tabulare. Un titolo grande può avere una spaziatura più stretta, mentre un campo di testo mantiene la propria leggibilità alla dimensione di lettura. Nel portale il nome tecnico, il titolo italiano e la descrizione occupano posizioni ricorrenti. La zona più ampia resta a disposizione del componente. Un calendario e un suggerimento da tastiera possono così avere ampiezze diverse sulla stessa pagina.

## Dalla pagina alla segnaletica

Il manuale FFS del 1978–80 documenta la costruzione del segno, i pittogrammi, i numeri dei binari e le dimensioni delle insegne. Hans Hartmann progettò il marchio nel 1972. Il lavoro successivo di Müller-Brockmann e collaboratori affronta la relazione fra segni, testi e supporti. Per un’interfaccia questo suggerisce di mantenere stabile il significato di una posizione. La voce selezionata, il titolo della vista e il suo contenuto formano un percorso che si può seguire anche da tastiera. [Museum für Gestaltung Zürich, manuale FFS](https://old.eguide.ch/en/objekt/sbb/)

Il sistema digitale contemporaneo delle FFS pubblica differenti numeri di colonne, margini e distanze fra colonne in funzione dello spazio disponibile. Le sue indicazioni per il visual design trattano anche zoom e aree interattive. È un precedente concreto per documentare le misure di un prodotto. Nella nostra libreria le soglie sono riferite al contenitore, così una griglia dentro un pannello reagisce allo spazio del pannello. [FFS, layout di Lyne](https://digital.sbb.ch/en/design-system/lyne/design-tokens/layout/) · [FFS, visual design accessibile](https://digital.sbb.ch/en/accessibility/roles/visual-design/)

## Le misure di Alpina

| Contenitore | Colonne | Margine interno | Spazio fra colonne |
| --- | ---: | ---: | ---: |
| Fino a 35,99 rem | 4 | 16 px | 12 px |
| Da 36 rem | 8 | 24 px | 16 px |
| Da 54 rem | 12 | 32 px | 24 px |

I pixel nella tabella corrispondono a una radice di 16 px. Il modulo di Alpina è 0,25 rem. Corpo e interlinea sono accoppiati per ruolo. Si usano 12/16 per annotazioni, 14/20 per etichette, 16/24 per lettura, 24/28 per titoli, 48/48 o 64/64 per il manifesto. L’interlinea governa il ritmo verticale anche quando il corpo, come nel caso dei 14 px, cade fra due moduli. Le misure sono scelte digitali di Alpina. Il testo cresce con le preferenze del lettore. La griglia guida la posizione dei blocchi. Una frase lunga può occupare più righe.

## Come leggere il portale

1. Nel campionario, passa da 320 a 960 px e attiva «Mostra griglia». Segui la prima cifra degli orari e la prima lettera dei titoli.
2. Nell’indice, apri una voce e poi una molto più lunga. Controlla il richiamo rosso e la posizione di Anteprima, Codice e Sorgente.
3. Nella rubrica, cambia lingua, filtra i contatti e ordina gli importi. Confronta i margini anche quando il testo va a capo.
4. Nel grafico, confronta le quantità leggendo le etichette. Nei moduli, prova una selezione e un errore. Identifica entrambi anche ignorando il colore.

La distribuzione comprende gli stessi componenti utilizzati per l’indice, i comandi, il blocco di codice e la navigazione del portale. Il catalogo consente di confrontare il codice dell’esempio con i file installabili. Chi adotta la libreria può quindi ricostruire il comportamento che ha appena provato.