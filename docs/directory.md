# Build an Italian–German address book

We started with an empty React project and the package downloaded from the Alpina 0.4 portal. The Code and API views were our reference for the components. The second version of the app uses the 0.5 portal. The address book runs locally and uses fictional records.

## Language and contact data

Keep contact data separate from interface labels. Switching languages changes headings, fields, messages, and actions. A contact's name, street, and locality retain the values entered by the user. Keep the search query, current contact, and draft in application state. Set the document language to the selected locale. Pass that locale to the name comparator when sorting records.

The heading and display roles of `Typography` support automatic hyphenation in the document language and can break a long word that has no available hyphenation point. A German compound can then fit at a viewport width of 320 px.

The `locales` prop of `LocaleSelect` sets the available options and their order. With a controlled select, the current value must be one of those options. To keep both languages visible, use two buttons in a `ButtonGroup` so a single action switches languages.

## Layout

`Grid` sets the page columns. `Stack` places a heading beside an action, or groups related controls with spacing from theme tokens. Children in a row wrap when the German translation takes more room. Use `columnGap` to set a different horizontal gap. `Item current={active}` keeps all rows aligned and marks the record whose details are visible. For a canton filter, `CantonSelect allLabel="All cantons"` supplies an empty option the user can select again. The native `onChange` value distinguishes all cantons from a single canton code. The application sets the maximum page width and its own editorial hierarchy.

## Contact actions

Give `DropdownMenu` a label that identifies the contact. `align="end"` aligns the menu to the end of its button and `size="compact"` fits a list row. Add `separatorBefore` and `tone="danger"` to distinguish the removal action. The application handles confirmation and changes to the records. Keep the button's `triggerRef` to restore focus after Cancel. After removal, move focus to a control that still exists.
