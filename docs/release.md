# Upgrading from 0.4 to 0.5

Download `alpina-ui-0.5.1.tgz` from Installation. All imports and 77 registry identifiers from 0.4 remain available. Version 0.5 adds `Stack`, a single-axis layout component with modular spacing, alignment, and wrapping, bringing the registry to 78 entries. Version 0.5.1 provides the English catalog and documentation.

## Action menus

Existing items with `value`, `label`, `disabled`, and `onSelect` continue to work. Add a divider before an item with `separatorBefore`, and use `tone="danger"` for a removal action. The menu's `align` and `size` props let it sit at the edge of a row. The portal example demonstrates editing and removing a record with explicit confirmation.

## Language selection

When you omit `locales`, `LocaleSelect` shows all four Swiss national languages. For a bilingual service, pass `locales={['it-CH', 'de-CH']}` and use the same two locales in application state.

## Updating copied source

Install the local package, then compare your files with `npx --no-install alpina diff dropdown-menu locale-select`. If you used a custom destination, pass the same `--dir` option. Add the new layout component with `npx --no-install alpina add stack`. Review local customizations in the diff before applying an update.
