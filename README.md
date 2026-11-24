# Alpina UI

78 componenti React e TypeScript. Alpina riunisce una griglia tipografica responsiva, controlli da tastiera e formati svizzeri nelle quattro lingue nazionali. Bianco, nero e rosso sono gli inchiostri del sistema. Il portale è un’applicazione della libreria pubblica e funziona offline. Puoi usare il pacchetto ESM oppure copiare i sorgenti modificabili con la CLI.

Le 66 famiglie dell’indice principale di shadcn/ui hanno una voce Alpina. Le altre 12 includono la griglia e la composizione in righe flessibili, la struttura del portale e i moduli svizzeri. La guida documenta le capacità effettive di ogni famiglia e le differenze fra le due librerie. [Corrispondenze](docs/coverage.md)

Nel campionario puoi attivare gli assi della griglia, cambiare la larghezza del contenitore e confrontare i valori effettivi con le regole. La ricerca ricostruisce riferimenti e decisioni progettuali attraverso le opere di Hofmann, Müller-Brockmann e Gerstner e il manuale FFS. [Ricerca sulla grafica svizzera](docs/research.md)

## Prova il catalogo

Scarica il catalogo e apri il file nel browser, anche offline. Nel campionario di tipografia puoi attivare le guide per vedere colonne e ritmo. Ogni componente ha una demo interattiva, la scheda API e il sorgente. Se compili il progetto da un clone, trovi lo stesso portale in `site/index.html`. [Scarica il catalogo 0.5.0](https://github.com/stedbrown/alpina-ui/releases/download/v0.5.0/alpina-ui-catalogo.html) · [Metodo e misure](docs/design.md)

## Installa e sviluppa

In un progetto con React e React DOM 18.2 o 19 puoi installare il pacchetto direttamente dalla release GitHub. La guida spiega come importare un componente, caricare il CSS o copiare i sorgenti con la CLI. [Avvio rapido](docs/start.md)

```sh
npm install https://github.com/stedbrown/alpina-ui/releases/download/v0.5.0/alpina-ui-0.5.0.tgz
```

Per ricostruire libreria e catalogo dal sorgente usa Node.js 20.6 o successivo e npm.

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run catalog
npm run test:browser
npm pack
```

Per i test browser usa Chrome/Chromium disponibile sul sistema o imposta `CHROME_PATH` al suo eseguibile. Per rigenerare il catalogo dopo aver cambiato l’inventario, esegui prima la build. I test Node usano la cartella compilata `dist`. Il lockfile fissa le dipendenze di sviluppo.

## Struttura

| Cartella o file | Contenuto |
| --- | --- |
| `src/ui` | 40 componenti di base, inclusi Grid, Typography e DataTable |
| `src/interactive` | 23 componenti interattivi e logica condivisa |
| `src/swiss` | 9 componenti svizzeri, dataset e formattatori |
| `src/portal` | 6 componenti per struttura, indice, codice e documentazione |
| `src/theme.css` | Variabili dei due temi |
| `cli` e `registry.json` | Comandi di distribuzione e inventario delle dipendenze |
| `dist` | ESM, tipi e CSS pronti all’uso |
| `catalog` e `site` | Sorgenti del catalogo e versione HTML offline |
| `tests` | Verifiche di distribuzione, CLI, formati e interazione |
| `docs` | Guide delle API e fonti dei dati svizzeri |

Le API complete si trovano nelle guide per [componenti di base](docs/core.md), [interazioni](docs/interactive.md) e [formati svizzeri](docs/swiss.md).

## Progettare una rubrica bilingue

La rubrica degli atelier mostra ricerca, filtri e modifica di un indirizzo in italiano e tedesco. Il rapporto di adozione misura quanto CSS applicativo serve e quali regole sono passate nella libreria. [Scarica la rubrica da provare](https://github.com/stedbrown/alpina-ui/releases/download/v0.5.0/Rubrica-Alpina-IT-DE.html) · [Sorgenti dell’esempio](recipes/rubrica) · [Rapporto di adozione](recipes/rubrica/PROVA.md)

## Consultare e aggiornare

Ciascuna voce del portale offre quattro viste. Anteprima mantiene il contenuto inserito durante la consultazione di Codice, API e Sorgente. Nel selettore di larghezza puoi provare il componente dentro contenitori diversi e leggerne la larghezza effettiva. Gli indirizzi come `#swiss-address-form/api` aprono direttamente la relativa vista.

Per esaminare i sorgenti copiati dopo aver installato una nuova versione puoi usare `npx --no-install alpina diff`. Il comando confronta il progetto con il pacchetto locale. [Guida alla CLI](docs/cli.md) · [Novità e aggiornamento dalla 0.4](docs/release.md)

## Dimensioni della versione 0.5.0

Esegui `npm run size` dopo la build per ripetere la misura. Il test raggruppa le esportazioni con esbuild, minifica per ES2022 e comprime con gzip. React e React DOM sono dipendenze peer esterne alla misura. I risultati si riferiscono ai componenti distribuiti. Il catalogo dimostrativo incorpora anche React, esempi e sorgenti.

| Importazione | Byte gzip |
| --- | ---: |
| Solo Button, JavaScript | 252 |
| Solo CurrencyCHF, JavaScript | 639 |
| Solo Dialog, JavaScript | 1.156 |
| Tutte le esportazioni JavaScript | 25.417 |
| Foglio di stile completo, tema incluso | 11.195 |
| Solo CSS del pulsante, tema escluso | 737 |

## Licenza

Il codice originale di Alpina UI è distribuito con licenza MIT. Per i dati derivati da Unicode CLDR si applica la licenza Unicode inclusa nel progetto. [Licenza MIT](LICENSE) · [Licenza Unicode](docs/UNICODE-LICENSE.txt)
