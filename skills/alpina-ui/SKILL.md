---
name: alpina-ui
description: Build or update React interfaces with Alpina UI. Use this skill to choose components, check their installed TypeScript contracts, compose the Swiss typographic grid, and localize Swiss forms and formats.
license: MIT
---

# Work with Alpina UI

Start with the version used by the application. Package imports and editable component copies are both supported. Follow the convention already present in the project.

## Find the actual API

- With Alpina's MCP server connected, use `search_components` to find a registry identifier, then `get_component` to read its import path and public TypeScript declaration. Request a listed source file when a type extends a shared interface. For example, the item type for `dropdown-menu` inherits its action fields from `interactive/action-list.tsx`.
- Without MCP, use `npx --no-install alpina list` in the application. The installed package includes `registry.json`, declarations under `dist/`, editable sources under `src/`, and English Markdown under `docs/`. Use the installed declarations to check prop names, subcomponents, and controlled state.
- For a packaged application, import the full stylesheet once at its entry point with `import "alpina-ui/styles.css"`. If the project copies source, preview dependencies with `npx --no-install alpina add <component> --dry-run`. After a package upgrade, `alpina diff` identifies locally edited copies.

## Compose the interface

Use `Grid` and `GridItem` when elements must align to shared columns. Use `Stack` for a group whose spacing, direction, baseline alignment, or wrapping should hold as labels change length. Use `Typography`'s element and visual variant separately so heading order follows the document. Look up the `design` guide for Alpina’s type roles, spacing unit, and 4/8/12-column behavior.

For an action menu followed by a confirmation dialog, keep the menu trigger reference and restore focus when the dialog closes. Read the `directory` guide for the complete flow, including where focus goes after a record is deleted.

For Swiss address inputs, dates, or CHF amounts, use the `swiss` guide to choose a component or formatter. Keep the interface locale separate from stored postal addresses and civil dates. When switching languages mid-edit, keep the draft and update the form labels. The IT/DE address book demonstrates this interaction.
