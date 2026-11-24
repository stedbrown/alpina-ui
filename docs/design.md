# Come si costruisce una pagina svizzera

Nel manifesto di Armin Hofmann per la Kunsthalle Basel del 1959, quattro cognomi occupano il posto che ci si aspetterebbe di vedere riservato a un’immagine. Il numero degli scultori, il luogo e le date completano il manifesto. Guardalo prima da lontano e poi da vicino: il contenuto resta identico, ma il corpo dei caratteri, la disposizione e il vuoto stabiliscono tempi di lettura diversi. È la domanda da porre anche a un’interfaccia. Che cosa deve riconoscere subito chi la usa? Che cosa potrà leggere dopo? [Barbara Junod, *Swiss Style forever*, DFAE, 20 maggio 2025](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

Guarda come Hofmann tratta il cognome più lungo. Divide Aeschbacher fra due righe e sposta la seconda parte verso destra. Bill, molto più corto, occupa un'altra posizione. Le differenze di lunghezza diventano una composizione; il gruppo più piccolo con sede e date riunisce invece le informazioni pratiche. La scheda d’archivio riporta un supporto di 128 × 90 cm e una stampa offset a due colori. Qui si possono osservare separatamente una misura fisica del manifesto e una scelta compositiva dell’autore. [Archivio dei manifesti di Hofmann, scheda ZHdK 02-0831 e riproduzione](https://plakatarchiv.com/gestalter/Hofmann_Armin_1959-1964/documents/doc1/pdf/full.pdf)

## Due scuole e più di un modo di usare la griglia

Junod ricostruisce il passaggio dal mestiere al metodo. Nei corsi di grafica applicata avviati a Basilea e Zurigo nel 1915, il progetto si imparava anche in laboratorio. Più tardi, a Zurigo, la rivista trilingue *Neue Grafik* rese visibile una pratica comune a più autori. Preparare gli stessi contenuti per più lingue è un buon esercizio per capire quell’esperienza: si fissa una posizione per ciascun ruolo, poi si prova se il testo continua a funzionare quando cambia lunghezza. [Storia della formazione e di *Neue Grafik*, DFAE](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

Il racconto della Biblioteca nazionale mette in evidenza gli elementi condivisi fra le due scuole: impaginazione strutturata, caratteri senza grazie, geometria, fotografia e un uso misurato del colore. L’esposizione *The Swiss Grid* documenta anche le differenze: nella scuola basilese di Ruder e Hofmann il rapporto tra fotografia, lettere e spazio poteva suggerire una disposizione più libera. Univers, sviluppato come famiglia coordinata di larghezze e pesi, offriva a Ruder molti modi di graduare l’importanza del testo. Un confronto fra i manifesti della mostra fa vedere quanto possano cambiare le composizioni pur seguendo gli stessi principi. [Biblioteca nazionale svizzera](https://www.nb.admin.ch/en/the-international-style-1950-1970) · [Poster House, *The Swiss Grid*](https://swissgrid.posterhouse.org/)

Un caso editoriale permette di mettere alla prova il metodo lungo più anni. Tra il 1958 e il 1965 uscirono diciotto numeri di *Neue Grafik*, curati da Richard Paul Lohse, Josef Müller-Brockmann, Hans Neuburg e Carlo Vivarelli. Lo stesso progetto doveva accogliere articoli, immagini e testi in tedesco, inglese e francese. Per Alpina ne ricavo una prova pratica: sostituire un titolo breve con uno lungo, poi verificare se orario, luogo e titolo successivo restano facili da trovare. [Lars Müller Publishers, edizione in facsimile di *Neue Grafik*](https://www.lars-mueller-publishers.com/neue-grafiknew-graphic-designgraphisme-actuel-1958-1965)

## Che cosa veniva misurato

Il supporto di stampa poteva avere un formato comune. Per l’interno della pagina si progettava un reticolo in rapporto al materiale da ordinare. Nel manuale di Josef Müller-Brockmann del 1981, l’editore documenta esempi da 8 a 32 **campi**. Un campo è un’area ottenuta suddividendo lo spazio in orizzontale e in verticale. Anche due griglie con lo stesso numero di campi possono avere proporzioni diverse. [Niggli, *Grid systems in graphic design*](https://niggli.ch/en/products/rastersysteme-fur-die-visuelle-gestaltung)

Prendi un orario. La colonna delle ore deve contenere comodamente «09.30». Il titolo dell’incontro può occupare più colonne e andare a capo. Se entrambi partono da assi costanti, l’occhio ritrova l’orario successivo anche quando il titolo precedente occupa due righe. Una colonna lasciata vuota separa due gruppi senza aggiungere riquadri. Con cifre tabulari le ore si confrontano anche all’interno della colonna. È così che una misura acquista un compito.

Il sistema d’informazione delle FFS, progettato a partire dal 1978 da Müller-Brockmann e Peter Spalinger, è un esempio di questo principio applicato su scala: una struttura modulare tiene insieme indicazioni diverse lungo il percorso di un viaggiatore. Per un’applicazione, l’equivalente è riuscire a passare da un elenco a un modulo e riconoscere subito titolo, dato, azione e messaggio di stato. [L’esempio FFS nell’articolo di Junod](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

## Le misure scelte per Alpina

Questi valori sono una specifica di questa libreria. Si possono verificare nel campionario e sostituire nel tema. Le equivalenze in pixel presuppongono una dimensione radice di 16 px. Il codice usa rem per rispettare le preferenze di lettura.

| Ruolo | Corpo / altezza di riga | Funzione |
| --- | --- | --- |
| Didascalia | 12 / 16 px | Metadati, unità, informazioni di supporto |
| Etichetta | 14 / 20 px | Nome di un campo o di un’azione |
| Testo corrente | 16 / 24 px | Istruzioni e paragrafi |
| Titolo di sezione | 24 / 28 px | Punto di ingresso in un gruppo |
| Titolo principale | 48 / 48 px | Prima informazione da riconoscere |

«16 / 24» significa che un carattere di corpo 16 px è composto in righe alte 24 px. Tre righe occupano 72 px, equivalenti a 18 moduli verticali da 4 px. Il ritmo riguarda i riquadri delle righe. L’altezza visibile delle lettere e la posizione della linea di base dipendono anche dalle metriche del carattere disponibile.

| Larghezza del contenitore | Colonne | Canale fra colonne | Margine per lato |
| --- | ---: | ---: | ---: |
| Meno di 36 rem | 4 | 12 px | 16 px |
| Da 36 a meno di 54 rem | 8 | 16 px | 24 px |
| Da 54 rem | 12 | 24 px | 32 px |

Su un contenitore largo 952 px, la griglia maggiore riserva 64 px ai margini e 264 px agli undici canali. Restano 624 px, cioè 52 px per colonna. Un blocco largo quattro colonne misura quindi 280 px, compresi i tre canali interni. La stessa regola vale quando il componente si trova dentro un pannello dell’app. È il contenitore a determinare la griglia.

## Usala in un progetto

```tsx
import { Grid, GridItem, Typography } from "alpina-ui"
import "alpina-ui/styles.css"

export function Appuntamento() {
  return (
    <Grid>
      <GridItem small={4} medium={2} large={3}>
        <Typography as="p" variant="label">09.30 – 10.15</Typography>
      </GridItem>
      <GridItem small={4} medium={6} large={9}>
        <Typography as="h2" variant="heading">Leggere un manifesto</Typography>
        <Typography>Laboratorio di composizione tipografica</Typography>
      </GridItem>
    </Grid>
  )
}
```

`Grid` accetta `guides` per visualizzare le colonne e il modulo verticale. `GridItem` governa quante colonne occupare a ogni larghezza. `Typography` separa il ruolo visivo dal livello semantico che assegni con `as`. Per copiare solo questi sorgenti usa `npx --no-install alpina add grid typography`.

## Righe di controlli

Usa `Grid` per assegnare porzioni della pagina e `Stack` per comporre gli elementi dentro una porzione. Con `direction="row"` i figli vanno a capo quando esauriscono lo spazio, anche passando da un'etichetta italiana a una tedesca più lunga. `gap={2}` vale due moduli, cioè 8 px con una radice di 16 px. `justify="space-between"` distribuisce due gruppi ai limiti dello spazio disponibile. In colonna i figli si estendono in larghezza e il valore predefinito di gap è 4.

```tsx
<Stack direction="row" gap={2} justify="space-between">
  <Typography as="h2" variant="heading">Contatti</Typography>
  <Button onClick={apriModulo}>Nuovo contatto</Button>
</Stack>
```
