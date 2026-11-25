# Upgrading Alpina UI

## Version 0.12.0

Install the [0.12.0 archive](https://alpina-ui.vercel.app/alpina-ui-0.12.0.tgz). Display snapshots for negative chart and table values now contain U+2212. Holiday queries keep the statutory default. Choose common observance to include the documented office closures. [Print documents](https://alpina-ui.vercel.app/docs/components/invoice-document/) · [Designer kit](https://alpina-ui.vercel.app/kit/) · [Package quality](https://github.com/stedbrown/alpina-ui/blob/main/docs/package-quality.md)

## Version 0.11.0

Install `https://alpina-ui.vercel.app/alpina-ui-0.11.0.tgz`. Check currency text snapshots that previously expected a hyphen on negative balances. Forms retain manual postal entry. Pass a canton to opt into holiday markers. The three framework examples run against the packed package. [Component status](https://alpina-ui.vercel.app/status/) · [Before and after](https://alpina-ui.vercel.app/releases/0.11/) · [Full changelog](https://github.com/stedbrown/alpina-ui/blob/main/CHANGELOG.md)

## Version 0.10.0

Install `https://alpina-ui.vercel.app/alpina-ui-0.10.0.tgz`. Source-copy projects can run `npx --no-install alpina diff` to inspect local changes before adopting the updated styles.

The default Swiss date is now numeric. Request an explicit `dateStyle` when a sentence needs a written month. Five-centime cash rounding is opt-in. An explicit light or dark appearance takes precedence inside an automatic theme. Check locally overridden spacing against the development overlay, particularly in forms with multiline labels. [Changelog](https://github.com/stedbrown/alpina-ui/blob/main/CHANGELOG.md) · [Design principles](https://alpina-ui.vercel.app/principles/) · [Swiss components](https://alpina-ui.vercel.app/docs/guides/swiss/)

## Version 0.9.0

Install the versioned archive in an existing React 18.2 or 19 project. Applications that import the package can continue using the same component names. For locally copied components, run `npx --no-install alpina diff` after installing the new version to review changes. [Download the 0.9.0 package](https://alpina-ui.vercel.app/alpina-ui-0.9.0.tgz) · [CLI guide](https://alpina-ui.vercel.app/docs/guides/cli/)

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-0.9.0.tgz
```

- **Router links and refs.** `Button`, `Badge`, `TextLink` and individual menu or breadcrumb items accept `asChild`. Supply one element that forwards its props and ref to the underlying control. Leaf components forward refs and preserve caller classes alongside their library classes. [Migration guide](https://alpina-ui.vercel.app/docs/guides/migration/)
- **Typography and themes.** Import `alpina-ui/fonts.css` to serve the Latin Inter WOFF2 files from your own application. Tables, CHF amounts and Swiss dates use tabular figures. The optional `alpina-ui/tailwind.css` bridge maps Tailwind v4 utilities to Alpina tokens. The theme builder previews light and dark combinations, reports text contrast and exports the CSS variables. [Design guide](https://alpina-ui.vercel.app/docs/guides/design/) · [Theme builder](https://alpina-ui.vercel.app/themes/)
- **Swiss forms and billing.** `IbanInput`, `AhvInput` and `PhoneInput` validate entries and format completed numbers on blur. `SwissQrBill` renders a SIX 2.4 payment section with a scannable QR Code. Use `printSwissQrBill` to print the selected slip and follow the print guide to check the result on paper. [Swiss forms](https://alpina-ui.vercel.app/docs/guides/swiss/) · [Swiss QR-bill guide](https://alpina-ui.vercel.app/docs/guides/qr-bill/)
- **Copyable pages.** Use `npx --no-install alpina add block/dashboard` to copy the dashboard into your app. The login, dashboard, account settings and CHF pricing pages use public Alpina components. Their source exposes the data and callbacks that connect them to your application. [Block gallery and installation commands](https://alpina-ui.vercel.app/blocks/)

## Version 0.8

`Icon` adds a family of original SVG pictograms to the registry. Render `<Icon name="git-branch" size={18} />` beside a repository link. Adjacent text gives the link its accessible name. When a symbol stands alone and conveys information, set its `label`. [Icon gallery](https://alpina-ui.vercel.app/icons/) · [Icon reference](https://alpina-ui.vercel.app/docs/components/icon/)

## Version 0.7.1

In `SwissAddressForm`, the postal code, locality and canton controls line up when they share a row, including when a hint or validation message wraps. [Swiss address form](https://alpina-ui.vercel.app/docs/components/swiss-address-form/)

## Version 0.7

The library adds three entries. Use `Steps` to identify the current stage of a workflow, `DescriptionList` to pair terms with their values and `Figure` to keep a specimen with its caption. The component index includes usage guidance for each entry. [Component index](https://alpina-ui.vercel.app/docs/components/)

Use `Grid width="site"` for a shared page frame, `Typography variant="title"` for a responsive page heading and `Stack surface="ink" inset={6}` to place controls on a contrasting surface. The homepage, workshop registration and invoice review demonstrate these public building blocks. [Example projects](https://alpina-ui.vercel.app/examples/)

### Interaction changes

- Tab now enters a toggle group once. Use the arrows to move focus and Space to toggle a choice. Action menus accept a `shortcut` hint for an application-defined keyboard binding.
- The address form confirms a successful save in the active language. Error text appears before the invalid control. To customize the new confirmation, supply `labels.saved`.
- Pass `clearable` to a date picker or `clearLabel` to a combobox to offer a way to remove a selection. Their default selection behavior is preserved.
- Data tables expose sorting instructions through `sortHint`. Translate the hint for multilingual tables. Numeric cells align amounts without splitting ordinary franc values.

Projects that copied source can inspect their local changes with `npx --no-install alpina diff` before updating. [CLI guide](https://alpina-ui.vercel.app/docs/guides/cli/)

## Version 0.6

The public site has dedicated documentation, runnable examples, and agent tools. Existing catalog bookmarks still open their component, guide, or project. The single-file catalog remains available for offline use. [Documentation](https://alpina-ui.vercel.app/docs/) · [Projects](https://alpina-ui.vercel.app/examples/) · [Agent tools](https://alpina-ui.vercel.app/agents/)

Version 0.6.0 added Grid surfaces and a column ruler, poster and lead type roles, and TextLink navigation variants. The local CLI also accepts `alpina mcp` for read-only access to its installed reference files.

## From 0.4 to 0.5

All imports and 77 registry identifiers from 0.4 remain available. Version 0.5 adds `Stack`, a single-axis layout component with modular spacing, alignment, and wrapping, bringing the registry to 78 entries. Version 0.5.1 introduced the English catalog and documentation.

## Action menus

Existing items with `value`, `label`, `disabled`, and `onSelect` continue to work. Add a divider before an item with `separatorBefore`, and use `tone="danger"` for a removal action. The menu's `align` and `size` props let it sit at the edge of a row. The portal example demonstrates editing and removing a record with explicit confirmation.

## Language selection

When you omit `locales`, `LocaleSelect` shows all four Swiss national languages. For a bilingual service, pass `locales={['it-CH', 'de-CH']}` and use the same two locales in application state.

## Updating copied source

Install the local package, then compare your files with `npx --no-install alpina diff dropdown-menu locale-select`. If you used a custom destination, pass the same `--dir` option. Add the new layout component with `npx --no-install alpina add stack`. Review local customizations in the diff before applying an update.
