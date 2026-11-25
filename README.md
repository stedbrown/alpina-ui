# Alpina UI

Alpina UI is a collection of 81 React components that brings Swiss typographic design to the web. Its responsive grid, left-aligned type, and black, white, and red palette carry through from the smallest control to the documentation site. Swiss address, date, and currency components support the country’s four national languages.

## Explore Alpina

Switch invoice AP-104 between German, French and Italian on the homepage. The invoice uses the same supplier record and total calculation as the review application. Browse components by task and open a preview to read its interaction notes, inspect the types and copy the source. [Homepage](https://alpina-ui.vercel.app/) · [Component index](https://alpina-ui.vercel.app/docs/components/) · [Installation](https://alpina-ui.vercel.app/docs/)

Open the offline catalog in a browser to try every component, inspect its TypeScript API, and copy its source. Start with the typography specimen. Switch between 4, 8, and 12 columns to see how margins, gutters, and type sizes change with the available width. The portal uses the same public imports as any other Alpina application. [Download the offline catalog](https://github.com/stedbrown/alpina-ui/releases/download/v0.7.0/alpina-ui-catalog.html) · [Design and measurements](docs/design.md)

The catalog covers all 66 families in the shadcn/ui component index reviewed on November 24, 2026. The other 15 entries include grid and stack layouts, Swiss localization tools, and components for building a documentation site. The comparison explains which interactions each family supports. [Component coverage](docs/coverage.md) · [Swiss graphic design research](docs/research.md)

## Install

For a project using React and React DOM 18.2 or 19, install the package from the GitHub release.

```sh
npm install https://github.com/stedbrown/alpina-ui/releases/download/v0.7.0/alpina-ui-0.7.0.tgz
```

Import the stylesheet once at your application entry point and use components by name. You can also copy the TypeScript and CSS into your project with `npx --no-install alpina add button`. [Quick start](docs/start.md)

```tsx
import "alpina-ui/styles.css"
import { Button } from "alpina-ui"

export function SaveButton() {
  return <Button type="submit">Save changes</Button>
}
```

## Build from source

Use Node.js 20.6 or later and npm. Run the build first. It generates the registry, ESM modules, declarations, and styles used by the catalog and tests.

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
| `src/ui` | 43 foundational components including Grid, Typography, and DataTable |
| `src/interactive` | 23 interactive components and their shared behavior |
| `src/swiss` | 9 Swiss components, datasets, and formatters |
| `src/portal` | 6 components for navigation, page structure, code samples, and documentation |
| `src/theme.css` | Tokens for the light and dark themes |
| `cli` and `registry.json` | Commands for copying source files and a record of their dependencies |
| `dist` | Generated ESM, TypeScript declarations, and CSS |
| `web`, `catalog`, and `site` | Public pages, interactive documentation, and the generated website and offline catalog |
| `skills/alpina-ui` | Agent skill distributed with the package |
| `tests` | Packaging, CLI, localization, and interaction tests |
| `docs` | Component guides, design research, and Swiss data sources |

## Try the bilingual address book

Search seven fictional design studios, switch between Italian and German, and edit an address without losing your draft. The adoption report tracks the CSS needed to build the example using only the portal. Moving layout, current-row styling, and long-word handling into Alpina reduced the application stylesheet from 56 declarations to 43. [Try the offline address book](https://github.com/stedbrown/alpina-ui/releases/download/v0.7.0/alpina-address-book-it-de.html) · [Example source](recipes/rubrica) · [Adoption report](recipes/rubrica/PROVA.md)

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
| Button JavaScript | 252 |
| CurrencyCHF JavaScript | 655 |
| Dialog JavaScript | 1,155 |
| All JavaScript exports | 27,112 |
| Full stylesheet including the theme | 12,737 |
| Button CSS without the theme | 736 |

## License

Alpina’s original code is available under the MIT license. Data derived from Unicode CLDR uses the included Unicode license. [MIT license](LICENSE) · [Unicode license](docs/UNICODE-LICENSE.txt)
