# Confrontare i sorgenti del progetto

Il comando `alpina add` copia i sorgenti modificabili e l’avviso MIT `ALPINA-LICENSE.txt` nella cartella dei componenti. Dopo avere installato un’altra versione del pacchetto, `alpina diff` confronta la copia nel progetto con il sorgente distribuito in quella versione. Il confronto usa file locali e lascia intatte le personalizzazioni.

## Individuare le differenze

Esegui il comando dalla directory del progetto. Se avevi usato `--dir` per la copia, indica la stessa directory anche nel confronto.

```sh
npx --no-install alpina diff
npx --no-install alpina diff swiss-address-form --dir src/components/alpina
```

Senza nomi, la CLI riconosce le voci del registro dal loro file di ingresso presente sul disco. Include il tema, l’avviso MIT e tutte le dipendenze di quelle voci. Ogni percorso compare una volta, anche quando è condiviso. Dopo `init` il confronto comprende il tema e l’avviso MIT. Puoi controllare un componente con un file di ingresso mancante indicandone il nome. `diff --all` confronta l’intero registro con il progetto.

| Stato | Lettura del risultato |
| --- | --- |
| `allineato` | La copia locale e il sorgente del pacchetto sono identici byte per byte. |
| `diverso` | Il contenuto differisce. La differenza può provenire da una personalizzazione, da una nuova versione del pacchetto o dalle terminazioni di riga. |
| `mancante` | Il componente selezionato usa questo file e il percorso locale è libero. |

La prima riga del rapporto identifica la versione installata. L’ultima riporta il totale per stato. I file creati dall’applicazione con nomi esterni al registro restano fuori dal confronto. La CLI può esaminare anche copie installate con Alpina 0.3. Il confronto usa il pacchetto corrente come riferimento e funziona senza una cronologia delle installazioni.

## Leggere una modifica riga per riga

```sh
npx --no-install alpina diff button --patch
```

Per ogni file diverso, `--patch` usa il comando Git locale per confrontare le due copie. Le righe precedute da `-` appartengono al progetto. Quelle precedute da `+` provengono dal pacchetto. La directory può trovarsi anche fuori da un repository Git. Il rapporto ordinario usa soltanto Node.js.

## Integrare un aggiornamento

1. Allinea la dipendenza `alpina-ui` alla versione che vuoi adottare.
2. Esegui `diff` indicando il componente da aggiornare. Per le dipendenze mancanti, `add` seguito dallo stesso nome e dalla stessa directory copia i file necessari.
3. Per i file diversi, esamina la patch e integra nell’editor le modifiche da adottare. Ogni nuovo `add` conserva le personalizzazioni presenti.
4. Prova il componente nel tuo flusso reale e ripeti `diff` per vedere quali differenze locali hai mantenuto.

Il processo termina con codice 0 quando ha completato il confronto, anche in presenza di differenze. Un argomento sconosciuto, un percorso non valido o un errore di lettura producono il codice 1.
