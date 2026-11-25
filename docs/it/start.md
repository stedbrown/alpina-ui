# Guida introduttiva

Alpina UI 1.0.0-rc.3 offre 97 componenti React installabili e cinque pagine da copiare. Include moduli ESM, dichiarazioni TypeScript, fogli di stile e sorgenti modificabili. Le guide introduttiva e svizzera sono disponibili anche in tedesco, francese e italiano. Il modulo per gli indirizzi fornisce etichette ed errori nelle quattro lingue nazionali.

<!-- alpina-download -->

Prima di installare puoi cercare un componente, copiare una pagina completa o provare la rubrica bilingue. Passa dall’italiano al tedesco mentre modifichi un contatto. [Componenti](https://alpina-ui.vercel.app/docs/components/) · [Pagine da copiare](https://alpina-ui.vercel.app/blocks/) · [Rubrica bilingue](https://alpina-ui.vercel.app/examples/bilingual-address-book/)

## Installare il pacchetto

Se usi shadcn/ui, scopri come far convivere le due librerie, collegare Tailwind v4 e migrare ogni famiglia di componenti. [Da shadcn/ui ad Alpina](https://alpina-ui.vercel.app/docs/guides/migration/)

In un progetto React 18.2 o 19 con Node.js 20 o successivo, installa dal portale l’archivio della versione desiderata.

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-1.0.0-rc.3.tgz
```

Se hai già scaricato l’archivio, esegui `npm install ./alpina-ui-1.0.0-rc.3.tgz` dalla sua cartella. Importa il CSS una sola volta nel punto di ingresso dell’applicazione. I moduli JavaScript funzionano anche sul server.

```tsx
import "alpina-ui/styles.css"
import { CurrencyCHF, SwissDate } from "alpina-ui"

export function Summary() {
  return (
    <p>
      <CurrencyCHF amount={1280.5} locale="fr-CH" />
      {" · "}
      <SwissDate value="2026-11-24" locale="fr-CH" />
    </p>
  )
}
```

## Includere un solo componente

Per ridurre il bundle importa il modulo del componente e il relativo foglio di stile, che comprende anche le regole delle dipendenze. Importa il tema una volta. I formattatori puri funzionano senza CSS.

```tsx
import "alpina-ui/theme.css"
import "alpina-ui/styles/button.css"
import { Button } from "alpina-ui/ui/button"

export function Confirm() {
  return <Button type="submit">Conferma</Button>
}
```

## Copiare i sorgenti nel progetto

Dopo l’installazione la CLI funziona offline. `list` elenca gli identificatori. `add` copia in `components/alpina` i file scelti, le dipendenze, il tema e l’avviso di licenza, preservando i file modificati. Il comando facoltativo `init` copia il tema e la sua licenza.

```sh
npx --no-install alpina list
npx --no-install alpina add button icon canton-select
npx --no-install alpina add dialog --dir src/components/alpina --dry-run
npx --no-install alpina add --all
```

Importa il tema da `./components/alpina/theme.css` e i componenti da percorsi come `./components/alpina/ui/button` o `./components/alpina/swiss/canton-select`, relativi al file che importa. Ogni TSX importa il proprio CSS e richiede un bundler che supporti CSS e TypeScript. Gli import relativi `.js` seguono la convenzione NodeNext.

Per copiare una pagina esegui `npx --no-install alpina add block/dashboard`. Il file `components/alpina/blocks/dashboard.tsx` usa gli import pubblici e accetta i dati delle tue fatture. Carica `alpina-ui/styles.css` una volta nell’applicazione. [Anteprima della dashboard](https://alpina-ui.vercel.app/blocks/dashboard/)

Per un link al repository, affianca `<Icon name="git-branch" size={18} />` al testo. `iconNames` elenca tutti i nomi disponibili. [Icone](https://alpina-ui.vercel.app/icons/) · [Documentazione di Icon](https://alpina-ui.vercel.app/docs/components/icon/)

## Personalizzare il tema

Le classi iniziano con `al-`. Applica il tema scuro all’app intera o a una sua sezione. I caratteri predefiniti sono Helvetica Neue, Helvetica, Arial e il sans serif di sistema. Importa `alpina-ui/fonts.css` per ospitare Inter localmente. Carica le variabili personalizzate dopo il tema. Il configuratore permette di cambiare accento e passo della griglia, controllare il contrasto e copiare il CSS. [Design](https://alpina-ui.vercel.app/docs/guides/design/) · [Configuratore del tema](https://alpina-ui.vercel.app/themes/)

```tsx
<section data-al-theme="dark">
  <Button>Salva</Button>
</section>
```

```css
.my-app {
  --al-accent: #eb0000;
  --al-on-accent: white;
  --al-radius: 0;
  --al-font: "Helvetica Neue", Helvetica, Arial, sans-serif;
}
```

## Impostare la lingua dell’interfaccia

Racchiudi un sottoalbero in `AlpinaProvider` per condividerne la lingua. Una prop `locale` esplicita prevale sul provider più vicino e un provider annidato prevale su quello esterno. I componenti con testi inglesi supportano anche `en`. Le funzioni pure, anche nelle Server Actions, ricevono ancora la lingua come argomento posizionale. Se copi i sorgenti con la CLI, importa il provider da `swiss/alpina-provider` nella stessa cartella di destinazione dei componenti copiati.

```tsx
import { AlpinaProvider, FileInput } from "alpina-ui"

export function Attachments() {
  return <AlpinaProvider locale="it-CH"><FileInput name="attachments" /></AlpinaProvider>
}
```

## Esecuzione e accessibilità

L’esempio Next.js 16 mostra due fatture pubbliche su `/invoices/[id]` con Cache Components. La pagina fornisce gli ID con `generateStaticParams()`, attende i parametri della rotta sul server e passa i dati a `InvoiceDocument`. Un piccolo componente client gestisce la stampa. Per fatture private leggi e autorizza la richiesta sul server dentro un confine Suspense. [Rotta delle fatture](https://github.com/stedbrown/alpina-ui/tree/main/integrations/next-app-router/app/invoices) · [Routing Next.js](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

Tre progetti eseguibili verificano una Server Action Next.js, link React Router e un modulo React Hook Form con schema Zod. Ciascuno comprende una build di produzione e un test nel browser. [Progetti e istruzioni](https://github.com/stedbrown/alpina-ui/tree/main/integrations)

I controlli usano HTML nativo. I componenti interattivi usano il browser dopo l’idratazione. I dialoghi modali chiamano `HTMLDialogElement.showModal()`. Con React Server Components aggiungi `"use client"` nei componenti con stato interattivo, callback o render prop. Puoi importare `formatCHF` e `formatSwissDate` nel codice server.

Verifica i flussi completi con i tuoi testi, le traduzioni e i colori. Il progetto comprende test automatici di tastiera e focus per i componenti interattivi.
