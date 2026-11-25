# Atelier address book

This Italian–German example uses Alpina UI to search, create and edit contact details for seven fictional design studios. Changes last until you reload the page. Try it in the portal, or build the standalone HTML file below for offline use. [Open the bilingual address book](https://alpina-ui.vercel.app/examples/bilingual-address-book/)

## Try the workflow

Search by studio name, town, canton, or postal code. Select a canton and switch languages. The filter stays active. Select a name to view its address, or open its action menu to edit or remove the entry. Removal requires confirmation. You can switch languages halfway through an edit and continue from the same draft.

## Build and test

Use Node.js 20 or later and npm. The recipe installs Alpina UI 1.0.0-rc.4 from the archive in its `vendor` directory. The lockfile records its integrity and pins the other dependencies. From the repository root, run the following commands. [Alpina UI 1.0.0-rc.4 package](https://alpina-ui.vercel.app/alpina-ui-1.0.0-rc.4.tgz)

```sh
cd recipes/rubrica
npm ci
npm run build
npm test
```

The build writes `dist/rubrica-bilingue.html` with JavaScript and CSS embedded. Browser tests require Chrome or Chromium. Set `CHROME_PATH` to choose an executable.

The `AtelierDirectory` component lives in `src/app.tsx`. Its standalone entry imports `alpina-ui/styles.css`. The layout, type, controls and contact detail panel use public Alpina components. Run `node scripts/css-count.mjs` in this directory to check the recipe’s application stylesheet count. [Adoption report](PROVA.md)
