# Alpina UI

Alpina UI brings Swiss typographic design to React. Its 97 components share a responsive grid, left-aligned type, square corners, and a black, white, and red palette. Use them to build a form, format a CHF amount, or print the payment section of a Swiss QR-bill. Address, date, and currency components support Switzerland’s four national languages.

## Explore Alpina

Use the grid overlay to inspect an interface at its actual width. Press Ctrl+Shift+G on the portal to see margins, columns and the four-pixel module. The principles gallery shows how the same timetable, price list or bilingual instruction reads under two different arrangements. [Design principles](https://alpina-ui.vercel.app/principles/) · [Grid reference](https://alpina-ui.vercel.app/docs/components/grid/)

Change the size of a poster edition, switch an invoice between four languages or read the press hours as a table on the homepage. Follow a component link to inspect its types and copy the source. The icon gallery shows the original Alpina symbols used for navigation, actions and status. [Homepage](https://alpina-ui.vercel.app/) · [Component index](https://alpina-ui.vercel.app/docs/components/) · [Icon gallery](https://alpina-ui.vercel.app/icons/) · [Installation](https://alpina-ui.vercel.app/docs/)

Open the offline catalog in a browser to try every component, inspect its TypeScript API, and copy its source. Start with the typography specimen. Switch between 4, 8, and 12 columns to see how margins, gutters, and type sizes change with the available width. The portal uses the same public imports as any other Alpina application. [Offline catalog](https://alpina-ui.vercel.app/catalog.html) · [Design and measurements](docs/design.md)

The catalog covers all 66 families in the shadcn/ui index reviewed on November 24, 2026. Its 31 additional entries include layout primitives, interface icons, Swiss payment and identity fields, and documentation components. The migration table maps each family to its Alpina equivalent and explains differences in the APIs. [Migration guide](https://alpina-ui.vercel.app/docs/guides/migration/) · [Component coverage](docs/coverage.md) · [Swiss graphic design research](docs/research.md)

## Install

For a project using React and React DOM 18.2 or 19, install the versioned package archive served by the portal.

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-0.14.0.tgz
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

Designers can download both appearances as typed DTCG 2025.10 JSON or a standalone Style Dictionary configuration. The editable SVG and print-ready A4 PDF include 4-, 8- and 12-column grids, the baseline and six type sizes. [Designer kit](https://alpina-ui.vercel.app/kit/)

## Copy a page

Run one of these commands in a project with Alpina installed. Each block uses public components and ships as editable TSX. The dashboard includes a chart and data table. The pricing page switches between monthly and annual CHF prices. [Block previews](https://alpina-ui.vercel.app/blocks/)

```sh
npx --no-install alpina add block/login
npx --no-install alpina add block/dashboard
npx --no-install alpina add block/account-settings
npx --no-install alpina add block/pricing
npx --no-install alpina add block/public-service
```

## Swiss forms and payments

Edit one title in German, French, Italian and Romansh with `MultilingualField`. The postal address form offers locality and canton suggestions after the fourth postcode digit. Calendar and DatePicker can mark public holidays for a canton and its supported regions. Use `addBusinessDays` to schedule across weekends and public holidays. [Multilingual field](https://alpina-ui.vercel.app/docs/components/multilingual-field/) · [Holiday and postcode sources](docs/swiss.md)

`IbanInput`, `AhvInput`, `UidInput` and `PhoneInput` format Swiss bank accounts, social insurance numbers, business identifiers and phone numbers. Use `SwissAddressForm` with `format="ech-person"` or `format="ech-organisation"` for structured Swiss street addresses. `SwissQrBill` validates account and reference combinations, encodes the payment data, and prints a 210 × 105 mm payment section and receipt. [Interactive payment slip](https://alpina-ui.vercel.app/docs/components/swiss-qr-bill/) · [QR-bill guide](docs/qr-bill.md)

Choose statutory or common observance for a cantonal work calendar. The common schedule adds documented office closures and marks them as customary. [Scope and sources](https://alpina-ui.vercel.app/docs/guides/swiss/)

Place a letter address for a left- or right-window envelope with the historical SN 010130 profiles. For an itemized invoice, enter VAT-exclusive CHF prices and quantities. Alpina calculates VAT per rate, can round a cash total to five centimes and prints a payment section with the same payable amount on the last page. [Letter](https://alpina-ui.vercel.app/docs/components/letter/) · [InvoiceDocument](https://alpina-ui.vercel.app/docs/components/invoice-document/)

Read an incoming payment slip with the device camera, a local image or a PDF. Review the creditor, account, reference and amount before confirming. The offline catalog includes the file decoders. [Scan a QR-bill](https://alpina-ui.vercel.app/docs/components/qr-bill-scanner/)

Use the same localized Standard Schema validator in a form and a Next.js Server Action. For a ledger, choose CHF or decimal columns, sort Swiss dates, print repeated headings, and reconcile group subtotals with the final total. [Validation and Server Actions](https://alpina-ui.vercel.app/docs/guides/validation/) · [Accounting table](https://alpina-ui.vercel.app/docs/components/data-table/)

## Charts and framework examples

Use `BarChart`, `LineChart`, `Sparkline` or `ChartTable` for SVG graphics with directly labelled observations and a semantic data table. Three working applications demonstrate App Router server actions, React Router links, and Swiss input validation with React Hook Form and Zod. [Chart examples](https://alpina-ui.vercel.app/docs/components/bar-chart/) · [Integration projects](integrations/) · [Component status](https://alpina-ui.vercel.app/status/)

## Build from source

CI uses Node.js 24 and npm. Run the build first. It generates the registry, ESM modules, declarations, and styles used by the catalog and tests.

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run catalog
npm run test:browser
npm run test:integrations
npm pack
```

Serve `site/` with a static HTTP server to browse the website from its homepage. Open `site/catalog.html` directly for the self-contained offline catalog. Browser tests use Chrome or Chromium. Set `CHROME_PATH` to select a specific executable.

| Path | Contents |
| --- | --- |
| `src/ui` | 49 foundational components including Grid, Typography, Icon, and DataTable |
| `src/interactive` | 23 interactive components and their shared behavior |
| `src/swiss` | 18 Swiss components, plus datasets, validators, and formatters |
| `src/portal` | 6 components for navigation, page structure, code samples, and documentation |
| `src/theme.css` | Tokens for the light and dark themes |
| `blocks` | Five complete page templates copied by the CLI |
| `cli` and `registry.json` | Commands for copying source files and a record of their dependencies |
| `dist` | Generated ESM, TypeScript declarations, and CSS |
| `web`, `catalog`, and `site` | Public pages, interactive documentation, and the generated website and offline catalog |
| `skills/alpina-ui` | Agent skill distributed with the package |
| `tests` | Packaging, CLI, localization, and interaction tests |
| `docs` | Component guides, design research, and Swiss data sources |

## Try the bilingual address book

Search seven fictional design studios, switch between Italian and German, and edit an address without losing your draft. The adoption report tracks the CSS needed to build the example using only the portal. Moving layout, current-row styling, and long-word handling into Alpina reduced the application stylesheet from 56 declarations to 43. [Try the address book](https://alpina-ui.vercel.app/examples/bilingual-address-book/) · [Example source and offline build](recipes/rubrica) · [Adoption report](recipes/rubrica/PROVA.md)

## Inspect and update a component

Each component page covers appropriate uses, alternatives, accessibility and wording, with examples in German, French, Italian and Romansh. Each page has four views. The preview keeps your input when you switch to the example code, API reference, or distributed source. Adjust the preview width to see how a component behaves in a narrow container. A link such as `#swiss-address-form/api` opens the reference directly.

After upgrading the package, run `npx --no-install alpina diff` to compare copied components with the installed version. [CLI guide](docs/cli.md) · [Migration notes](docs/release.md)

### Try a complete workflow

Copy the residence certificate application with `alpina add block/public-service`. It collects an AHV number and structured address, restores a locally saved draft with its original files and presents a summary before submission. The example issues a local demo reference. Connect the supplied callback to your service to issue a real case number. [Public service form](https://alpina-ui.vercel.app/blocks/public-service/)

- Register for a print workshop, correct an invalid field and return from review to edit a choice. [Workshop registration](https://alpina-ui.vercel.app/examples/workshop-registration/)
- Compare an invoice with a purchase order, request a correction with a note and reopen the decision. [Invoice review](https://alpina-ui.vercel.app/examples/invoice-review/)

Both projects use the library’s public components and ship without an application stylesheet. [All examples](https://alpina-ui.vercel.app/examples/)

## Use Alpina with a coding agent

Run `npx skills add stedbrown/alpina-ui --skill alpina-ui` to give a coding agent instructions for composing Alpina interfaces. The optional local MCP server lets it search the installed registry and read version-matched TypeScript declarations, source files, and guides. [Agent setup](https://alpina-ui.vercel.app/agents/) · [Machine-readable index](https://alpina-ui.vercel.app/llms.txt)

## Bundle sizes

Run `npm run size` after building to measure individual imports. The benchmark uses esbuild to minify ES2022 output and then applies gzip. React and React DOM are external peer dependencies. The full offline catalog also contains source files, interactive examples, and React itself.

| Import | Gzipped bytes |
| --- | ---: |
| Button JavaScript | 1,014 |
| CurrencyCHF JavaScript | 1,042 |
| Dialog JavaScript | 1,155 |
| Icon JavaScript, all 32 drawings | 1,245 |
| All JavaScript exports in a single bundle | 802,657 |
| Full stylesheet including the theme | 19,290 |
| Button CSS without the theme | 763 |

The single-bundle figure includes the image and PDF decoders. In a split Vite or Next application, the scanner loads a decoder when a file needs it. The production Vite Button example loads one JavaScript asset. The package quality guide documents the checks for root imports and subpaths, including esbuild’s split-output behavior. [Package quality](docs/package-quality.md)

## Releases

Version 0.14.0 adds a localized file dropzone, a five-language public-service form with resumable attachments, and optical Inter display typography. The CI checks the public API and exercises the English catalog with German and French browser controls. [API stability](docs/api-stability.md) · [Changelog](CHANGELOG.md) · [Before and after](https://alpina-ui.vercel.app/releases/0.11/) · [Swiss forms](docs/swiss.md) · [Visual testing](docs/visual-testing.md)

Pushes run CI. A maintainer can publish a verified package archive with provenance by starting the separate release workflow. [Maintainer guide](docs/npm-release.md)

## License

Alpina’s original code is available under the MIT license. Data derived from Unicode CLDR uses the Unicode license. The optional Inter fonts use the SIL Open Font License 1.1. The scanner package includes jsQR, Mozilla PDF.js and their decoder license notices in `dist/swiss/`. The residential postcode directory is adapted from ©swisstopo open geodata and carries its source attribution. [swisstopo terms](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices) [MIT license](LICENSE) · [Unicode license](docs/UNICODE-LICENSE.txt) · [Inter font license](src/fonts/OFL.txt)
