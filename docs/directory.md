# Costruire una rubrica italiano–tedesco

Per questa prova abbiamo iniziato da un progetto React vuoto e dal pacchetto scaricato dal portale Alpina 0.4. Le pagine Codice e API sono state il riferimento per i componenti. La seconda versione dell’app usa il portale 0.5. Il progetto della rubrica comprende esempi fittizi e funziona in locale.

## Lingua e dati

Conserva i dati dei contatti separati dalle etichette dell’interfaccia. Un cambio di lingua modifica titoli, campi, messaggi e azioni. Nome, via e località di un contatto restano quelli inseriti dall’utente. Mantieni ricerca, contatto e bozza nello stato dell’app. Assegna al documento il valore di lingua scelto. Per ordinare i nomi, usa un comparatore che riceve la lingua corrente.

I titoli `Typography` di livello heading e display prevedono la sillabazione automatica nella lingua del documento e possono spezzare una parola lunga quando manca un punto di sillabazione. Questo evita che un composto tedesco allarghi la pagina a 320 px.

La proprietà `locales` di `LocaleSelect` limita le opzioni e ne controlla l’ordine. In un selettore controllato, il valore corrente deve appartenere alle opzioni. Se scegli due pulsanti sempre visibili, anche `ButtonGroup` permette di presentare le due lingue con una sola azione per passare dall’una all’altra.

## Disposizione

`Grid` determina le colonne della pagina. `Stack` dispone nello stesso gruppo titolo e azione o più controlli con un intervallo ricavato dai token. In una riga i figli vanno a capo se la traduzione tedesca richiede più spazio. Usa `columnGap` se vuoi intervalli orizzontali diversi da quelli verticali. `Item current={attivo}` allinea tutte le righe e segnala quella di cui sono visibili i dettagli. Per un filtro cantone, `CantonSelect allLabel="Tutti i cantoni"` presenta un'opzione vuota riselezionabile. Il valore nativo in `onChange` distingue tutti i cantoni da un singolo codice. Il progetto può definire la larghezza massima del foglio e la propria gerarchia editoriale.

## Azioni per contatto

Fornisci a `DropdownMenu` un’etichetta che identifichi il contatto. `align="end"` allinea il menu alla fine del pulsante; `size="compact"` si adatta alle righe. Per la rimozione, `separatorBefore` e `tone="danger"` distinguono l’azione. La conferma e la modifica dei dati appartengono all’app. Per restituire il focus al pulsante dopo Annulla, conserva il suo `triggerRef`. Dopo l’eliminazione porta il focus su un controllo che esiste ancora.