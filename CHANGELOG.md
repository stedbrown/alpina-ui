# Changelog

## 0.14.0 · 25 November 2026

- **Public API** FileInput and its Dropzone alias expose the actual input ref, localized labels and file changes. Attachment accepts upload mode and keeps its existing download-link API. QrBillScanner uses the shared picker for images and PDFs.
- Catalog date, color and validation examples use authored controls and messages. The select picker and numeric fields retain keyboard and form behavior. German and French Chromium runs check for platform-drawn labels and validation bubbles.
- Heading tracking and leading now follow the actual font size. The optional self-hosted Inter files include optical sizes. [Display spacing](https://alpina-ui.vercel.app/docs/guides/design/)
- Copy the multilingual residence certificate application with `alpina add block/public-service`. Drafts preserve attachment bytes in IndexedDB. The submission callback receives a request ID for retries and returns the case number.
- The new public API report, stability policy and 1.0 checklist describe compatibility, deprecations and release review. [API stability](https://github.com/stedbrown/alpina-ui/blob/main/docs/api-stability.md)

## 0.13.0 · 25 November 2026

- InvoiceDocument shows two decimal places for every CHF unit and net price. Fractional quantities can carry a unit, such as 2.5 h or 1.25 m². Sub-cent prices retain their arithmetic precision.
- Use Rumantsch Grischun in Swiss forms, validations, payment references and correspondence. The portal demonstrates all four national languages and the number formatter preserves exact decimal strings on systems without Romansh ICU data.
- Share nine localized Standard Schema v1 validators between browser and server. The Next.js example checks an IBAN again at submission. [Validation guide](https://alpina-ui.vercel.app/docs/guides/validation/)
- Reconcile grouped CHF ledgers with decimal alignment, accounting negatives, subtotals, double-ruled totals, Swiss-date sorting and repeated A4 headings. [DataTable](https://alpina-ui.vercel.app/docs/components/data-table/)
- Parse Swiss QR payment data with field and line errors. Scan on-device, read a local image or multipage PDF, and confirm the payment summary. [QrBillScanner](https://alpina-ui.vercel.app/docs/components/qr-bill-scanner/)
- Every component reference documents its keys. Browser regressions cover forced colors and higher contrast in light and dark, 200% text size and WCAG text spacing. A reflowable payment transcription accompanies the print slip.

## 0.12.0 · 25 November 2026

- Restore the red Alpina masthead, visible GitHub label and “Swiss UI for React.” headline. Financial values, dates and identifiers keep their line. Browser checks inspect text geometry at eight widths and compare the homepage and public routes against screenshot references.
- Charts, sparklines, numeric typography and table cells use a mathematical minus sign in displayed negative numbers.
- A named Button import from the package root drops postal and QR data in split esbuild, Vite and Next production builds. Raw esbuild address consumers can opt into a separate offline postcode chunk. [Bundling details](docs/package-quality.md)
- Set holiday observance to statutory or common in Swiss scheduling helpers and calendars. The Swiss guide lists customary office closures with their geographic scope and sources. [Holiday schedules](docs/swiss.md)
- Download light and dark design tokens, ready-to-build Style Dictionary configurations and an editable A4 grid and type sheet. [Designer kit](https://alpina-ui.vercel.app/kit/)
- Print A4 letters for left- or right-window envelopes using historical SN 010130 layouts. Print itemized VAT invoices with exact decimal totals and a QR payment section on the last page. [Swiss documents](docs/swiss.md)
- The portal preloads Inter and prerenders component previews and blocks. Continuous integration checks homepage, component and block performance, accessibility and cumulative layout shift.
- Every component has guidance on when to use it, alternatives, accessibility, and wording in Switzerland’s four national languages, with paired examples. [Component reference](https://alpina-ui.vercel.app/docs/components/)

## 0.11.0 · 25 November 2026

### Forms and scheduling

- Edit translations in German, French, Italian and Romansh with optional English, per-language completion and native form values. Choose tabs, parallel editors or textareas.
- Calendar and DatePicker mark federal and cantonal holidays with support for regional rules. `swissHolidays` and `addBusinessDays` work with local civil dates. The Swiss forms guide documents the geographic and historical scope.
- SwissAddressForm loads the official residential postcode directory on the first complete postcode. Select a locality and canton, including postcodes that cross cantonal boundaries, or enter an address manually. The self-contained catalog also works offline.

### Data and appearance

- BarChart, LineChart, Sparkline and ChartTable draw SVG data graphics with text descriptions and accessible data tables.
- The portal opens in automatic appearance. Its control cycles through automatic, light and dark and remembers the choice. Negative franc amounts use a mathematical minus with a localized spoken equivalent.
- The portal revises column alignment, heading hierarchy and spacing. [Before and after](https://alpina-ui.vercel.app/releases/0.11/) · [Design notes on GitHub](https://github.com/stedbrown/alpina-ui/blob/main/docs/release-0.11-design.md)

### Packaging and adoption

- Three production integration projects exercise a Next.js Server Action, React Router navigation and React Hook Form with Zod. CI builds each against the packed library.
- Per-component size budgets and tree-shaking checks run alongside React Server Component compatibility checks. [Component status](https://alpina-ui.vercel.app/status/) records maturity and the latest source change.

## 0.10.0 · 25 November 2026

### Layout and reading

- Inspect columns, margins and the four-pixel baseline with `GridOverlay`. Press Ctrl+Shift+G on the portal to toggle the overlay. Modular grid rows, named field arrangements and subgrids let adjacent cards share label and value tracks.
- Prose, descriptions and numeric roles now distinguish running text from data. The default reading measure is 66ch. Headings balance, paragraphs wrap with a ragged edge, and Swiss language tags select the appropriate hyphenation rules.
- The portal’s [design principles](https://alpina-ui.vercel.app/principles/) compare eight design decisions with paired, live examples and source notes.

### Swiss data and documents

- `CurrencyCHF` accepts `cashRounding` for five-centime cash totals. Digital amounts keep their ordinary two-decimal precision. The formatter makes Swiss grouping explicit across runtimes.
- Numeric Swiss dates use day, month and four-digit year. Callers can still request written month names. Calendar rows start on Monday and expose ISO week numbers, including at year boundaries.
- `UidInput` validates and formats Swiss business identifiers. `SwissAddressForm` supports eCH-0010 postal fields. Existing address-book integrations can continue using the compact form.
- Alpina’s full stylesheet prints A4 documents with physical margins, repeated table headings and link destinations. Selective CSS imports can use `alpina-ui/print.css`. The QR payment slip retains its dedicated page and physical measurements.

### Appearance and corrections

- `data-al-theme="auto"` follows the device. Dark mode uses a lighter red with black button labels. Motion tokens honor reduced motion and loading placeholders reserve a static area.
- Tablet navigation collapses into a menu. The theme control stays beside it, search hints fit, and the theme builder uses English for its invoice preview. The Swiss QR-bill preview scales to its available width.

### Verification

- Responsive checks visit every public page at 360, 768, 800, 1024 and 1440 px. The test suite also audits accessibility with axe, measures component rhythm at three widths, and compares component screenshots in both themes at four widths.

## 0.9.0 · 25 November 2026

- Added `asChild` composition, leaf refs, optional local Inter fonts, a Tailwind v4 token sheet and a live theme builder.
- Introduced Swiss QR-bills and IBAN, AHV and telephone inputs. Added login, dashboard, account settings and CHF pricing blocks to the CLI.
- Prepared manual npm publishing with provenance. [Upgrade notes](docs/release.md)

Earlier changes, including the original icon set and address-form alignment, are recorded in the [release history](docs/release.md).
