# Upgrading Alpina UI

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
