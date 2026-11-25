# Changelog

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
