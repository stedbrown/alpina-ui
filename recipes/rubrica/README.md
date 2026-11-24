# Rubrica degli atelier · Atelierverzeichnis

Una rubrica italiano–tedesco per cercare, creare e modificare i recapiti di sette atelier fittizi. Le modifiche durano fino al ricaricamento della pagina. Puoi scaricare l’HTML dalla release e aprirlo direttamente nel browser, anche senza rete. [Release 0.5.0](https://github.com/stedbrown/alpina-ui/releases/tag/v0.5.0)

## Prova il flusso

Cerca un atelier per nome, città, cantone o numero postale. Seleziona un cantone e cambia lingua. Il filtro rimane attivo. Il nome del contatto apre la scheda. Il menu Azioni consente di modificare e rimuovere una voce. La rimozione richiede una conferma. Nel pannello di modifica puoi passare da IT a DE conservando i valori già inseriti.

## Ricostruisci e verifica

Servono Node.js 20 o successivo e npm. La cartella `vendor` contiene lo stesso pacchetto Alpina UI 0.5.0 distribuito dal portale. Il lockfile ne verifica l’integrità e fissa le versioni delle altre dipendenze.

Dalla radice del repository clonato esegui questi comandi.

```sh
cd recipes/rubrica
npm ci
npm run build
npm test
```

La build genera `dist/rubrica-bilingue.html` e incorpora JavaScript e CSS. Per i test serve Chrome oppure Chromium. Puoi impostare `CHROME_PATH` per indicare il percorso dell’eseguibile.

Il componente `AtelierDirectory` è in `src/app.tsx`. Il punto di ingresso `src/main.tsx` carica gli stili della libreria e quelli della rubrica. Per misurare il CSS specifico della rubrica esegui `node scripts/css-count.mjs` dalla cartella di questo esempio. La prova di adozione documenta la riduzione da 56 a 43 dichiarazioni e descrive le scelte rimaste a carico dell’applicazione. [Confronto fra 0.4 e 0.5](PROVA.md)
