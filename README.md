# Alpina UI

Alpina UI brings Swiss typographic design to React. Its 86 components share a responsive grid, left-aligned type, square corners, and a black, white, and red palette. Use them to build a form, format a CHF amount, or print the payment section of a Swiss QR-bill. Address, date, and currency components support Switzerland’s four national languages.

## Explore Alpina

Change the size of a poster edition, switch an invoice between three languages or read the press hours as a table on the homepage. Follow a component link to inspect its types and copy the source. The icon gallery shows the original Alpina symbols used for navigation, actions and status. [Homepage](https://alpina-ui.vercel.app/) · [Component index](https://alpina-ui.vercel.app/docs/components/) · [Icon gallery](https://alpina-ui.vercel.app/icons/) · [Installation](https://alpina-ui.vercel.app/docs/)

Open the offline catalog in a browser to try every component, inspect its TypeScript API, and copy its source. Start with the typography specimen. Switch between 4, 8, and 12 columns to see how margins, gutters, and type sizes change with the available width. The portal uses the same public imports as any other Alpina application. [Offline catalog](https://alpina-ui.vercel.app/catalog.html) · [Design and measurements](docs/design.md)

The catalog covers all 66 families in the shadcn/ui index reviewed on November 24, 2026. Its 20 additional entries include layout primitives, interface icons, Swiss payment and identity fields, and documentation components. The migration table maps each family to its Alpina equivalent and explains differences in the APIs. [Migration guide](https://alpina-ui.vercel.app/docs/guides/migration/) · [Component coverage](docs/coverage.md) · [Swiss graphic design research](docs/research.md)

## Install

For a project using React and React DOM 18.2 or 19, install the versioned package archive served by the portal.

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-0.9.0.tgz
```

Import the stylesheet once at your application entry point and use components by name. You can also copy the TypeScript and CSS into your project with `npx --no-install alpina add button`. [Quick start](docs/start.md)

```tsx
import "alpina-ui/styles.css"
import { Button } from "alpina-ui"

export function SaveButton() {
  return <Button type="submit">Save changes</Button>
}
```

Use `<Button asChild><a href="/invoices">Invoices</a></Button>` to style a link while retaining its native navigation and keyboard behavior. The same pattern works with router links, badges, text links, menu items, and breadcrumb links.

Import `alpina-ui/fonts.css` to self-host Inter. For Tailwind v4, add `@import "alpina-ui/tailwind.css";` after importing Tailwind in your stylesheet. The theme builder previews your accent, grid unit and color scheme, reports text contrast, and exports CSS variables. [Typography](docs/design.md) · [Theme builder](https://alpina-ui.vercel.app/themes/)

## Copy a page

Run one of these commands in a project with Alpina installed. Each block uses public components and ships as editable TSX. The dashboard includes a chart and data table. The pricing page switches between monthly and annual CHF prices. [Block previews](https://alpina-ui.vercel.app/blocks/)

```sh
npx --no-install alpina add block/login
npx --no-install alpina add block/dashboard
npx --no-install alpina add block/account-settings
npx --no-install alpina add block/pricing
```

## Swiss forms and payments

`IbanInput`, `AhvInput`, and `PhoneInput` format Swiss account, social insurance, and telephone numbers. `SwissQrBill` validates account and reference combinations, encodes the payment data, and prints a 210 × 105 mm payment section and receipt. [Interactive payment slip](https://alpina-ui.vercel.app/docs/components/swiss-qr-bill/) · [QR-bill guide](docs/qr-bill.md)

## Build from source

CI uses Node.js 24 and npm. Run the build first. It generates the registry, ESM modules, declarations, and styles used by the catalog and tests.

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run catalog
npm run test:browser
npm pack
```

Serve `site/` with a static HTTP server to browse the website from its homepage. Open `site/catalog.html` directly for the self-contained offline catalog. Browser tests use Chrome or Chromium. Set `CHROME_PATH` to select a specific executable.

| Path | Contents |
| --- | --- |
| `src/ui` | 44 foundational components including Grid, Typography, Icon, and DataTable |
| `src/interactive` | 23 interactive components and their shared behavior |
| `src/swiss` | 13 Swiss components, plus datasets, validators, and formatters |
| `src/portal` | 6 components for navigation, page structure, code samples, and documentation |
| `src/theme.css` | Tokens for the light and dark themes |
| `blocks` | Four complete page templates copied by the CLI |
| `cli` and `registry.json` | Commands for copying source files and a record of their dependencies |
| `dist` | Generated ESM, TypeScript declarations, and CSS |
| `web`, `catalog`, and `site` | Public pages, interactive documentation, and the generated website and offline catalog |
| `skills/alpina-ui` | Agent skill distributed with the package |
| `tests` | Packaging, CLI, localization, and interaction tests |
| `docs` | Component guides, design research, and Swiss data sources |

## Try the bilingual address book

Search seven fictional design studios, switch between Italian and German, and edit an address without losing your draft. The adoption report tracks the CSS needed to build the example using only the portal. Moving layout, current-row styling, and long-word handling into Alpina reduced the application stylesheet from 56 declarations to 43. [Try the address book](https://alpina-ui.vercel.app/examples/bilingual-address-book/) · [Example source and offline build](recipes/rubrica) · [Adoption report](recipes/rubrica/PROVA.md)

## Inspect and update a component

Each component page has four views. The preview keeps your input when you switch to the example code, API reference, or distributed source. Adjust the preview width to see how a component behaves in a narrow container. A link such as `#swiss-address-form/api` opens the reference directly.

After upgrading the package, run `npx --no-install alpina diff` to compare copied components with the installed version. [CLI guide](docs/cli.md) · [Migration notes](docs/release.md)

### Try a complete workflow

- Register for a print workshop, correct an invalid field and return from review to edit a choice. [Workshop registration](https://alpina-ui.vercel.app/examples/workshop-registration/)
- Compare an invoice with a purchase order, request a correction with a note and reopen the decision. [Invoice review](https://alpina-ui.vercel.app/examples/invoice-review/)

Both projects use the library’s public components and ship without an application stylesheet. [All examples](https://alpina-ui.vercel.app/examples/)

## Use Alpina with a coding agent

Run `npx skills add stedbrown/alpina-ui --skill alpina-ui` to give a coding agent instructions for composing Alpina interfaces. The optional local MCP server lets it search the installed registry and read version-matched TypeScript declarations, source files, and guides. [Agent setup](https://alpina-ui.vercel.app/agents/) · [Machine-readable index](https://alpina-ui.vercel.app/llms.txt)

## Bundle sizes

Run `npm run size` after building to measure individual imports. The benchmark uses esbuild to minify ES2022 output and then applies gzip. React and React DOM are external peer dependencies. The full offline catalog also contains source files, interactive examples, and React itself.

| Import | Gzipped bytes |
| --- | ---: |
| Button JavaScript | 1,017 |
| CurrencyCHF JavaScript | 716 |
| Dialog JavaScript | 1,155 |
| Icon JavaScript, all 32 drawings | 1,245 |
| All JavaScript exports | 37,204 |
| Full stylesheet including the theme | 13,774 |
| Button CSS without the theme | 763 |

## Releases

Pushes run CI. A maintainer can publish a verified package archive with provenance by starting the separate release workflow. [Maintainer guide](docs/npm-release.md)

## License

Alpina’s original code is available under the MIT license. Data derived from Unicode CLDR uses the Unicode license. The optional Inter fonts use the SIL Open Font License 1.1. [MIT license](LICENSE) · [Unicode license](docs/UNICODE-LICENSE.txt) · [Inter font license](src/fonts/OFL.txt)
