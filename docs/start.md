# Avvio rapido

Alpina UI 0.5.0 include 78 componenti per React, distribuiti come moduli ESM con tipi TypeScript, fogli di stile e sorgenti modificabili. Il catalogo e la guida sono in italiano. Il modulo indirizzo include le etichette e gli errori nelle quattro lingue nazionali. Negli altri componenti puoi passare le stringhe della tua applicazione.

<!-- alpina-download -->

## Installa il pacchetto locale

In un progetto React 18.2 o 19, con Node.js 20 o successivo, scarica il pacchetto dal portale, sposta il file `alpina-ui-0.5.0.tgz` nella radice del progetto e installalo.

```sh
npm install ./alpina-ui-0.5.0.tgz
```

Importa il CSS una volta nel punto di ingresso dell’app. I moduli JavaScript non caricano CSS implicitamente e si possono importare anche durante il rendering sul server.

```tsx
import "alpina-ui/styles.css"
import { CurrencyCHF, SwissDate } from "alpina-ui"

export function Riepilogo() {
  return (
    <p>
      <CurrencyCHF amount={1280.5} locale="fr-CH" />
      {" · "}
      <SwissDate value="2026-11-24" locale="fr-CH" />
    </p>
  )
}
```

## Includi un singolo componente

Per un bundle mirato puoi importare un modulo e il suo stile. Il CSS specifico include le regole delle dipendenze del componente. Importa il tema una volta. I formattatori puri non richiedono fogli di stile.

```tsx
import "alpina-ui/theme.css"
import "alpina-ui/styles/button.css"
import { Button } from "alpina-ui/ui/button"

export function Conferma() {
  return <Button type="submit">Conferma</Button>
}
```

## Copia i sorgenti nel progetto

Dopo l’installazione del pacchetto locale, la CLI funziona anche offline. Il comando `list` mostra i nomi del registro. `add` scrive i file scelti, il tema e le loro dipendenze sotto `components/alpina`. I file già modificati nel progetto vengono conservati. `init` prepara il solo tema ed è facoltativo.

```sh
npx --no-install alpina list
npx --no-install alpina add button canton-select
npx --no-install alpina add dialog --dir src/components/alpina --dry-run
npx --no-install alpina add --all
```

Con i sorgenti copiati, importa il tema da `./components/alpina/theme.css` e il componente da `./components/alpina/ui/button` o `./components/alpina/swiss/canton-select`. Adatta i percorsi alla posizione del file chiamante. I file TSX importano i rispettivi CSS e richiedono un bundler con supporto CSS e TypeScript. Gli import relativi `.js` nei sorgenti seguono la convenzione NodeNext.

## Personalizza il tema

Gli stili della libreria usano classi con prefisso `al-`. Puoi applicare il tema scuro a tutta l’app o a una singola sezione. Per personalizzare l’identità visiva, carica le tue variabili dopo il tema. Il tema preferisce Helvetica Neue e Helvetica, con Arial e il sans-serif di sistema come alternative. I ruoli tipografici e le misure di impaginazione sono descritti nella guida al metodo svizzero.

```tsx
<section data-al-theme="dark">
  <Button>Salva</Button>
</section>
```

```css
.mia-app {
  --al-accent: #eb0000;
  --al-on-accent: white;
  --al-radius: 0;
  --al-font: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

## Ambiente e accessibilità

I controlli di modulo usano gli elementi HTML nativi. I componenti interattivi richiedono il browser dopo l’idratazione. Le modali usano `HTMLDialogElement.showModal()`. Nei framework con React Server Components, inserisci `"use client"` nei componenti dell’app che gestiscono stato, callback o render prop interattive. Le funzioni `formatCHF` e `formatSwissDate` sono importabili anche in codice server.

Verifica i flussi della tua applicazione con le etichette, le traduzioni e i colori scelti. Il progetto include test automatici di tastiera e focus per i componenti interattivi.