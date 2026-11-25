<img src="web/assets/logo.svg" alt="A white A without a crossbar, shaped like a peak on a red square." width="64" height="64">

# Alpina UI

Open-source React components built on the Swiss typographic grid. Compose forms, tables and charts with a four-pixel rhythm, a measured type scale and one red accent.

[![CI](https://github.com/stedbrown/alpina-ui/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/stedbrown/alpina-ui/actions/workflows/ci.yml) [![MIT license](https://img.shields.io/badge/license-MIT-222222)](LICENSE) [![Package version](https://img.shields.io/badge/version-{{BADGE_VERSION}}-eb0000)](CHANGELOG.md)

[Live site]({{SITE}}/) · [Start here]({{SITE}}/start-here/) · [Documentation]({{SITE}}/docs/) · [Designer kit]({{SITE}}/kit/) · [Design principles]({{SITE}}/principles/) · [Changelog](CHANGELOG.md) · [API stability](docs/api-stability.md)

| Light | Dark |
| --- | --- |
| [![Alpina homepage in light appearance](docs/images/home-light.png)](docs/images/home-light.png) | [![Alpina homepage in dark appearance](docs/images/home-dark.png)](docs/images/home-dark.png) |

The live poster lets you set type size and tracking, operate a print queue, compare paper and ink, and enlarge a keyboard-operated form to 400%. [Explore the specimens]({{SITE}}/)

## Install in 30 seconds

In an existing React 18.2 or 19 app, install the versioned archive and import the stylesheet once.

```sh
npm install {{SITE}}/alpina-ui-{{VERSION}}.tgz
```

```tsx
import { Button, CurrencyCHF } from 'alpina-ui'
import 'alpina-ui/styles.css'

export function Checkout() {
  return <Button type="submit">Pay <CurrencyCHF amount={24} locale="de-CH" /></Button>
}
```

To own the source, run `npx --no-install alpina add button`. To copy a complete page, use `npx --no-install alpina add block/dashboard`. Import `alpina-ui/fonts.css` for self-hosted Inter. Components establish the typeface even in a document with an unstyled body. A Tailwind v4 token bridge is also available. [Installation guide]({{SITE}}/docs/) · [CLI commands]({{SITE}}/docs/guides/cli/)

## What comes with Alpina

- Issue a Swiss QR-bill with a SIX payment section, or read an incoming slip locally from a file or camera and confirm the parsed data. Generate QRR or RF references and print a short invoice, itemized VAT and its payment slip on one A4 sheet. [QR-bill guide]({{SITE}}/docs/guides/qr-bill/)
- Collect an eCH-0010 postal address with offline postcode suggestions. Embed the address fields in an existing form or a configurable multi-step service. Use the same field and checksum rules for AHV, UID, IBAN and payment references in the browser and on the server. [Shared validation]({{SITE}}/docs/guides/validation/)
- Edit translations in German, French, Italian and Romansh side by side. English is also available in the public-service workflow and validation messages. Apply statutory or common holiday calendars by canton when calculating business days. [Language fields]({{SITE}}/docs/components/multilingual-field/) · [Swiss formats]({{SITE}}/docs/guides/swiss/)
- Build a booking calendar with day availability and cantonal holidays. Compare budget and actuals as grouped bars, multiple lines or printable accounting tables. [Calendar]({{SITE}}/docs/components/calendar/) · [Accounting tables]({{SITE}}/docs/components/data-table/)
- Lay out a page on four, eight or twelve columns. Inter’s optical sizes, tabular figures and a four-pixel baseline carry through to tables, print and dark mode. Export the tokens and printable sheets for design work. [Principles]({{SITE}}/principles/) · [Kit]({{SITE}}/kit/) · [Theme builder]({{SITE}}/themes/)
- Inspect a component’s keyboard behavior and screen-reader guidance alongside its source. CI checks interactions, automated accessibility, forced colors and visual regressions. [Reference]({{SITE}}/docs/components/) · [Testing](https://github.com/stedbrown/alpina-ui/blob/main/docs/visual-testing.md)

## Component directory

{{INVENTORY}}

## Alpina and shadcn/ui

| When choosing a library | Alpina UI | shadcn/ui |
| --- | --- | --- |
| Distribution | Versioned React package or editable TypeScript and CSS through the Alpina CLI. | Open component source installed through a CLI, with a registry ecosystem for sharing code. |
| Design starting point | A Swiss editorial grid, square corners and a restrained red, white and black palette. | Customizable styles and themes for building your own design system. |
| Application fit | Swiss address, identity, holiday and payment rules are part of the package. | A general-purpose starting point for teams choosing their own domain components and rules. |

Teams already using shadcn/ui can migrate one component family at a time. API differences and equivalents are documented. [Alpina migration table]({{SITE}}/docs/guides/migration/) · [shadcn/ui documentation](https://ui.shadcn.com/docs) · [shadcn registries](https://ui.shadcn.com/docs/registry)

## Build with Alpina

- [Interactive examples]({{SITE}}/examples/) and [framework integrations](integrations) cover Next.js, React Router and React Hook Form. The [offline catalog]({{SITE}}/catalog.html) includes source, API references and working previews.
- [Agent tools]({{SITE}}/agents/) include a local read-only MCP server and an installable skill. [Machine-readable site index]({{SITE}}/llms.txt)
- [Component status]({{SITE}}/status/), [Beta review](docs/beta-review.md), [0.x migration](docs/migrate-1-0.md) and the [1.0 checklist](docs/1.0-checklist.md) describe the contracts and remaining decisions.
- Run `npm ci`, `npm run build`, `npm run typecheck`, `npm test` and `npm run catalog` for a local build. Browser, bundle and performance checks are documented in the [quality guide](docs/package-quality.md). Maintainers can regenerate this README with `node scripts/readme.mjs`.

## Site domain

Set `SITE_URL` to your HTTPS origin in the Vercel production environment and in the GitHub Actions repository variables. Use that value locally with `npm run catalog` and `node scripts/readme.mjs`, then commit the generated README. With the variable unset, the build uses the package homepage. Redeploy after a domain change so canonical links, the sharing card, sitemap, robots file and machine-readable index advertise the new address.

## License and data sources

Alpina’s original code and artwork use the MIT license. Inter is distributed under the SIL Open Font License. Locale data includes Unicode CLDR, postal localities are derived from ©swisstopo, and the local scanner includes jsQR and Mozilla PDF.js with their decoder notices. [MIT](LICENSE) · [Inter license](src/fonts/OFL.txt) · [Unicode license](docs/UNICODE-LICENSE.txt) · [swisstopo terms](https://www.swisstopo.admin.ch/en/terms-of-use-free-geodata-and-geoservices)
