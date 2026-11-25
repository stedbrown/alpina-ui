# Changelog

## Unreleased

- **Public API** ComponentPreview accepts `defaultWidth` and `onWidthChange`. The documentation keeps the chosen preview width in the address, so `?width=320` opens a narrow case that can be shared in a pull request.
- Centre the QR-bill scissors on the horizontal perforation and align them with the 5 mm margin.
- Rebuild the homepage around working components: an invoice dashboard, a Swiss form with postcode, canton and holiday lookup, and a QR-bill that re-encodes as you type. Install from npm with `npm install alpina-ui@next`.

## 1.0.0-rc.6 · 25 November 2026

- **Public API** NavigationMenu supports surface, brand and action composition with NavigationBrand, NavigationAction and ThemeToggle. Switch accepts children as an accessible label. GridSpecimen can host an isolated document for runnable comparisons. Existing call sites remain supported.
- Compare the same working form in shadcn/ui and Alpina, copy the source of each preview, and use a keyboard to explore form reflow at up to 400% zoom. The masthead joins the red cover and follows the current section throughout the portal.
- Keep poster-sized words intact in narrow columns, contain the QR payment disclosure marker on phones, and scope offscreen currency labels to the scrollable accounting table.
- Search for dialog and postcode phrases in German, French, Italian and Romansh. Install the project skill from GitHub and explore the four independently tested application briefs. [Agent tools](https://alpinaui.com/agents/)

## 1.0.0-rc.5 · 25 November 2026

- **Public API** The component registry exposes `homepage`. CLI help links to the documentation, and MCP replies include the project website and the selected component’s documentation URL.
- Move the portal, installation commands, component registry and assistant guides to [alpinaui.com](https://alpinaui.com/). Canonical URLs, language alternates, social cards and discovery files use the same origin.
- Preserve old bookmarks with path- and query-preserving HTTP 308 redirects. Both addresses serve the original bytes for every previously published release archive, including RC4.

## 1.0.0-rc.4 · 25 November 2026

- **Public API** Read the installed version from `alpina-ui/package.json`. Grid supports viewport covers and chapter spacing, GridItem can group entrance steps, and GridSpecimen can magnify its contents or use system colors. Typography adds folio and specimen roles, adjustable specimen size and numeric tracking. [Reviewed declarations](etc/alpina-ui.api.md)
- Establish the component font in unstyled consumer pages, including standalone postcode feedback, code samples and text inside layouts.
- Read invoice calculations and QR-bill details on narrow screens, and enlarge the payment slip independently of its physical print dimensions.
- Keep short invoice links and document codes together by default in DataTable. Set `nowrap: false` on a column to allow wrapping. Local MCP search now recognizes component names in five languages and common spelling errors.
- Rebuild the homepage as a full-height typographic poster with ten numbered sections, adjustable type, an interactive print shop, a keyboard-operated reflow demonstration and contrasting paper and ink proofs. Update the [light](docs/images/home-light.png) and [dark](docs/images/home-dark.png) first screens.
- Link both historical 0.11 release URLs directly to the [original changelog entry](#release-0-11-0).

## 1.0.0-rc.3 · 25 November 2026

- **Public API** Add `AlpinaProvider` for locale inheritance, the `nowrap` flag for custom DataTable columns and the opt-in `stripSeparators` option for QRR and creditor references. Typography adds a masthead role and configurable tracking. Grid supports an optional entrance sequence. [Reviewed declarations](etc/alpina-ui.api.md)
- Align address controls and move descriptions and errors below the field group. Keep day numbers separated at 180 px. FormSteps measures its actual labels before switching to a compact counter.
- Print the active tab panel at full width. FileInput retains valid files in the native form payload and reports individual rejected names. Primary action labels remain legible when Windows forces system colors.
- Organize documentation by task, translate Start and Swiss into German, French and Italian, and permanently redirect consolidated pages. Publish reader guides in the archive and provide ranked multilingual search and four tested workflows for coding agents.
- Introduce the flat-topped peak, three starting paths and an interactive typographic poster with grid, type, component, accessibility and theme specimens. See the [light](docs/images/home-light.png) and [dark](docs/images/home-dark.png) editions.

## 1.0.0-rc.2 · 25 November 2026

- **Public API** Add payment-reference generation and formatting, exact centime formatting, invoice content and address composition, shared address fields, responsive form navigation, server field feedback, booking availability, normalized Swiss input callbacks, file limits, queued notifications, sidebar navigation and comparative charts. Existing single-series charts and inline notifications continue to work. Pass `showWeekNumbers` explicitly to retain week numbers. See the [reviewed declarations](etc/alpina-ui.api.md).
- Keep identifiers and action labels intact, retain space for description lists, show desktop branding, and paint the document canvas in the chosen theme.
- Print one to eight standard invoice lines with their totals and QR payment slip on a single A4 sheet. Compact accounting rows use the printable width, with repeated headers, group headings and spanning total labels.
- Handle appointment status and disabled dates in a calendar that remains usable at 180 CSS pixels. Accept server-side corrections in multi-step services and return focus to the relevant field.
- Compare financial series with grouped bars and separate lines. A hatch distinguishes losses, intermediate axis labels orient readers and the alternative table preserves missing observations.
- The reference now shows expanded data shapes and explains CHF headings. The packed Next.js example exercises a dynamic invoice route with Cache Components.

## 1.0.0-rc.1 · 25 November 2026

- **Public API** Swiss identifier validation distinguishes shape and prefix errors from check-digit errors across fields, Standard Schema, server actions and QR payloads. Existing validation booleans and signatures remain usable. TableHead and TableCell accept independent text alignment, and guide tables retain the alignment of the original Markdown. The shared message helper accepts an optional reason. Portal, text, field and layout modules now expose the composable parts used by the reference site. See the [declaration report](etc/alpina-ui.api.md) for signatures.
- The residence application switches language navigation and progress independently when the actual row runs out of room. Keyboard focus follows the active representation.
- The [0.x migration guide](https://alpinaui.com/docs/guides/migrate-1-0/) includes executable examples. The [Beta review](docs/beta-review.md) recommends a disposition for every Beta entry and reserves decisions for the maintainer.
- CI installs a packed tarball at the minimum and latest supported React/React DOM versions in Next.js, Vite with React Router, and the React Hook Form example. Next exercises App Router server actions and Pages Router hydration.
- The generated GitHub directory lists every component and copyable block. New light and dark previews, the mountain A, share cards and machine-readable metadata use the same visual identity. SITE_URL configures the public origin.
- The website and its examples use public Alpina component markup and styles. A dogfooding check guards interactive controls and layout against site-only implementations.

## 0.14.0 · 25 November 2026

- **Public API** FileInput and its Dropzone alias expose the actual input ref, localized labels and file changes. Attachment accepts upload mode and keeps its existing download-link API. QrBillScanner uses the shared picker for images and PDFs.
- Catalog date, color and validation examples use authored controls and messages. The select picker and numeric fields retain keyboard and form behavior. German and French Chromium runs check for platform-drawn labels and validation bubbles.
- Heading tracking and leading now follow the actual font size. The optional self-hosted Inter files include optical sizes. [Display spacing](https://alpinaui.com/docs/guides/design/)
- Copy the multilingual residence certificate application with `alpina add block/public-service`. Drafts preserve attachment bytes in IndexedDB. The submission callback receives a request ID for retries and returns the case number.
- The new public API report, stability policy and 1.0 checklist describe compatibility, deprecations and release review. [API stability](https://github.com/stedbrown/alpina-ui/blob/main/docs/api-stability.md)

## 0.13.0 · 25 November 2026

- InvoiceDocument shows two decimal places for every CHF unit and net price. Fractional quantities can carry a unit, such as 2.5 h or 1.25 m². Sub-cent prices retain their arithmetic precision.
- Use Rumantsch Grischun in Swiss forms, validations, payment references and correspondence. The portal demonstrates all four national languages and the number formatter preserves exact decimal strings on systems without Romansh ICU data.
- Share nine localized Standard Schema v1 validators between browser and server. The Next.js example checks an IBAN again at submission. [Validation guide](https://alpinaui.com/docs/guides/validation/)
- Reconcile grouped CHF ledgers with decimal alignment, accounting negatives, subtotals, double-ruled totals, Swiss-date sorting and repeated A4 headings. [DataTable](https://alpinaui.com/docs/components/data-table/)
- Parse Swiss QR payment data with field and line errors. Scan on-device, read a local image or multipage PDF, and confirm the payment summary. [QrBillScanner](https://alpinaui.com/docs/components/qr-bill-scanner/)
- Every component reference documents its keys. Browser regressions cover forced colors and higher contrast in light and dark, 200% text size and WCAG text spacing. A reflowable payment transcription accompanies the print slip.

## 0.12.0 · 25 November 2026

- Restore the red Alpina masthead, visible GitHub label and “Swiss UI for React.” headline. Financial values, dates and identifiers keep their line. Browser checks inspect text geometry at eight widths and compare the homepage and public routes against screenshot references.
- Charts, sparklines, numeric typography and table cells use a mathematical minus sign in displayed negative numbers.
- A named Button import from the package root drops postal and QR data in split esbuild, Vite and Next production builds. Raw esbuild address consumers can opt into a separate offline postcode chunk. [Bundling details](docs/package-quality.md)
- Set holiday observance to statutory or common in Swiss scheduling helpers and calendars. The Swiss guide lists customary office closures with their geographic scope and sources. [Holiday schedules](docs/swiss.md)
- Download light and dark design tokens, ready-to-build Style Dictionary configurations and an editable A4 grid and type sheet. [Designer kit](https://alpinaui.com/kit/)
- Print A4 letters for left- or right-window envelopes using historical SN 010130 layouts. Print itemized VAT invoices with exact decimal totals and a QR payment section on the last page. [Swiss documents](docs/swiss.md)
- The portal preloads Inter and prerenders component previews and blocks. Continuous integration checks homepage, component and block performance, accessibility and cumulative layout shift.
- Every component has guidance on when to use it, alternatives, accessibility, and wording in Switzerland’s four national languages, with paired examples. [Component reference](https://alpinaui.com/docs/components/)

<a name="release-0-11-0"></a>

## 0.11.0 · 25 November 2026

### Forms and scheduling

- Edit translations in German, French, Italian and Romansh with optional English, per-language completion and native form values. Choose tabs, parallel editors or textareas.
- Calendar and DatePicker mark federal and cantonal holidays with support for regional rules. `swissHolidays` and `addBusinessDays` work with local civil dates. The Swiss forms guide documents the geographic and historical scope.
- SwissAddressForm loads the official residential postcode directory on the first complete postcode. Select a locality and canton, including postcodes that cross cantonal boundaries, or enter an address manually. The self-contained catalog also works offline.

### Data and appearance

- BarChart, LineChart, Sparkline and ChartTable draw SVG data graphics with text descriptions and accessible data tables.
- The portal opens in automatic appearance. Its control cycles through automatic, light and dark and remembers the choice. Negative franc amounts use a mathematical minus with a localized spoken equivalent.
- The portal revises column alignment, heading hierarchy and spacing. [Before and after](https://github.com/stedbrown/alpina-ui/blob/main/docs/release-0.11-design.md)

### Packaging and adoption

- Three production integration projects exercise a Next.js Server Action, React Router navigation and React Hook Form with Zod. CI builds each against the packed library.
- Per-component size budgets and tree-shaking checks run alongside React Server Component compatibility checks. [Component status](https://alpinaui.com/status/) records maturity and the latest source change.

## 0.10.0 · 25 November 2026

### Layout and reading

- Inspect columns, margins and the four-pixel baseline with `GridOverlay`. Press Ctrl+Shift+G on the portal to toggle the overlay. Modular grid rows, named field arrangements and subgrids let adjacent cards share label and value tracks.
- Prose, descriptions and numeric roles now distinguish running text from data. The default reading measure is 66ch. Headings balance, paragraphs wrap with a ragged edge, and Swiss language tags select the appropriate hyphenation rules.
- The portal’s [design principles](https://alpinaui.com/principles/) compare eight design decisions with paired, live examples and source notes.

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
