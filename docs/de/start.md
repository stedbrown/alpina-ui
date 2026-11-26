# Erste Schritte

Alpina UI 1.0.0-rc.7 enthält 97 installierbare React-Komponenten und fünf kopierbare Seiten. Das Paket liefert ESM-Module, TypeScript-Deklarationen, Stylesheets und bearbeitbaren Quellcode. Die Einführung und der Leitfaden zur Schweiz sind auch auf Deutsch, Französisch und Italienisch verfügbar. Das Adressformular bietet Feldbezeichnungen und Fehlermeldungen in allen vier Landessprachen.

<!-- alpina-download -->

Suche vor der Installation eine Komponente, kopiere eine vollständige Seite oder probiere das zweisprachige Adressbuch aus. Du kannst beim Bearbeiten eines Kontakts zwischen Italienisch und Deutsch wechseln. [Komponenten](https://alpinaui.com/docs/components/) · [Kopierbare Seiten](https://alpinaui.com/blocks/) · [Zweisprachiges Adressbuch](https://alpinaui.com/examples/bilingual-address-book/)

## Paket installieren

Wenn deine Anwendung shadcn/ui verwendet, zeigt der Leitfaden, wie beide Bibliotheken zusammenarbeiten, wie du Tailwind v4 einbindest und jede Komponentenfamilie migrierst. [Von shadcn/ui zu Alpina](https://alpinaui.com/docs/guides/migration/)

Installiere das Paket von npm in einem Projekt mit React 18.2 oder 19 und Node.js ab Version 20. Release Candidates erscheinen unter dem Tag `next`.

```sh
npm install alpina-ui@next
```

Das Portal stellt jede Version zusätzlich als Archiv mit SHA‑512-Prüfsumme bereit. Die URL legt die genaue Version im Lockfile fest: `npm install https://alpinaui.com/alpina-ui-1.0.0-rc.7.tgz`. Hast du das Archiv bereits heruntergeladen, führe `npm install ./alpina-ui-1.0.0-rc.7.tgz` in seinem Verzeichnis aus. Importiere das CSS einmal am Einstiegspunkt der Anwendung. Die JavaScript-Module lassen sich auch auf dem Server ausführen.

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

## Eine einzelne Komponente einbinden

Für ein kleineres Bundle importierst du das Komponentenmodul und dessen Stylesheet. Dieses enthält die Regeln seiner Abhängigkeiten. Importiere das Thema einmal. Reine Formatierungsfunktionen brauchen kein CSS.

```tsx
import "alpina-ui/theme.css"
import "alpina-ui/styles/button.css"
import { Button } from "alpina-ui/ui/button"

export function Confirm() {
  return <Button type="submit">Bestätigen</Button>
}
```

## Quellcode ins Projekt kopieren

Die CLI läuft nach der Installation offline. `list` zeigt die Namen im Register. `add` kopiert die gewählten Dateien, Abhängigkeiten, Thema und Lizenzhinweis nach `components/alpina` und erhält eigene Änderungen. Der optionale Befehl `init` kopiert das Thema und seinen Lizenzhinweis.

```sh
npx --no-install alpina list
npx --no-install alpina add button icon canton-select
npx --no-install alpina add dialog --dir src/components/alpina --dry-run
npx --no-install alpina add --all
```

Importiere das Thema aus `./components/alpina/theme.css` und Komponenten beispielsweise aus `./components/alpina/ui/button` oder `./components/alpina/swiss/canton-select`. Passe die Pfade an die importierende Datei an. Jede TSX-Datei importiert ihr CSS und erfordert einen Bundler mit CSS- und TypeScript-Unterstützung. Relative `.js`-Importe folgen NodeNext.

Kopiere eine Seite mit `npx --no-install alpina add block/dashboard`. Die Datei `components/alpina/blocks/dashboard.tsx` nutzt die öffentlichen Paketimporte und nimmt deine Rechnungsdaten entgegen. Lade `alpina-ui/styles.css` einmal in der Anwendung. [Dashboard-Vorschau](https://alpinaui.com/blocks/dashboard/)

Setze bei einem Repository-Link `<Icon name="git-branch" size={18} />` neben den Linktext. `iconNames` enthält alle verfügbaren Namen. [Symbolverzeichnis](https://alpinaui.com/icons/) · [Icon-Referenz](https://alpinaui.com/docs/components/icon/)

## Thema anpassen

Klassen beginnen mit `al-`. Verwende das dunkle Thema in der ganzen App oder einem Abschnitt. Die Vorgabe ist Helvetica Neue, Helvetica, Arial und die serifenlose Systemschrift. Importiere `alpina-ui/fonts.css` für lokal gehostetes Inter. Lade eigene Variablen nach dem Thema. Im Themeneditor kannst du Akzentfarbe und Rastereinheit anpassen, den Kontrast prüfen und das CSS kopieren. [Design](https://alpinaui.com/docs/guides/design/) · [Themeneditor](https://alpinaui.com/themes/)

```tsx
<section data-al-theme="dark">
  <Button>Speichern</Button>
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

## Die Sprache der Oberfläche setzen

Mit `AlpinaProvider` gibst du einem Teilbaum eine gemeinsame Sprache. Ein explizites `locale` an der Komponente hat Vorrang vor dem nächsten Provider, ein verschachtelter Provider vor seinem Elternteil. Komponenten mit englischen Texten unterstützen auch `en`. Reine Formatierungsfunktionen in Server Actions oder ausserhalb von React erhalten die Sprache weiterhin als Positionsargument. Bei mit der CLI kopierten Komponenten importierst du den Provider aus `swiss/alpina-provider` im selben Zielverzeichnis.

```tsx
import { AlpinaProvider, FileInput } from "alpina-ui"

export function Attachments() {
  return <AlpinaProvider locale="it-CH"><FileInput name="attachments" /></AlpinaProvider>
}
```

## Laufzeit und Barrierefreiheit

Das Beispiel für Next.js 16 stellt zwei öffentliche Musterrechnungen unter `/invoices/[id]` mit Cache Components dar. Die Seite liefert IDs über `generateStaticParams()`, wartet auf dem Server auf die Routenparameter und übergibt die Daten an `InvoiceDocument`. Eine Client-Komponente steuert die Druckschaltfläche. Prüfe bei privaten Rechnungen die Berechtigung auf dem Server innerhalb einer Suspense-Grenze. [Rechnungsroute](https://github.com/stedbrown/alpina-ui/tree/main/integrations/next-app-router/app/invoices) · [Next.js-Routing](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)

Drei lauffähige Projekte prüfen eine Next.js Server Action, Links mit React Router und ein React-Hook-Form-Formular mit Zod-Schema. Jedes umfasst einen Produktionsbuild und einen Browsertest. [Integrationsprojekte und Einrichtung](https://github.com/stedbrown/alpina-ui/tree/main/integrations)

Die Steuerelemente verwenden natives HTML. Interaktive Komponenten greifen nach der Hydrierung auf den Browser zu. Modale Dialoge verwenden `HTMLDialogElement.showModal()`. Setze bei React Server Components `"use client"` in Anwendungskomponenten mit interaktivem Zustand, Callbacks oder Render-Props. `formatCHF` und `formatSwissDate` lassen sich im Servercode importieren.

Teste vollständige Abläufe mit deinen Beschriftungen, Übersetzungen und Farben. Das Projekt enthält automatische Tastatur- und Fokustests für interaktive Komponenten.
