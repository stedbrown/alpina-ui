# Commands, selections, and panels

A menu item executes an action. A combobox selects a value for a form. A modal panel suspends work on the page beneath it until the user closes it. Each has its own keyboard and focus conventions. [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/)

## Search and commands

**Combobox** requires `label`, `options`, and `empty`. Each option has a unique `value`, a `label`, and optional `detail`, `keywords`, and `disabled`. Search handles accents and keywords. The arrows move through enabled results. Enter confirms, and Escape restores the previous selection's text. Tab also retains the last confirmed choice. Set `name` to include its identifier in form data. Use `required` and `requiredMessage` for validation. Supply `value` and `onValueChange` for external control. [Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

**Command** brings searchable actions into a dialog. Pass `title`, `trigger`, `closeLabel`, `searchLabel`, `empty`, and `items`. Add `onSelect` to an item or receive its identifier in `onValueSelect`. Search receives focus on opening. Arrow keys change the active item and Enter runs it. To connect a keyboard shortcut, control the dialog through `open` and `onOpenChange`.

**ContextMenu** attaches `items` to `children` named by `label`. Open it with the secondary pointer button or Shift + F10. **Menubar** takes `label` and `menus`, each with `value`, `label`, and `items`. Horizontal arrows change groups. Vertical arrows move through actions. Home, End, and prefix search move focus. Disabled items remain readable and cannot be activated. Escape returns to the originating control. [Menu and menubar pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/)

## Previews and decisions

**AlertDialog** requires `title`, `description`, `cancelLabel`, `confirmLabel`, and `onConfirm`. Cancel receives initial focus. Escape cancels. Clicking the backdrop leaves the confirmation open. Execute the operation in `onConfirm`. Use a controlled dialog to present asynchronous operations and errors. [Alert dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/)

**Drawer** shares Dialog's title, description, content, footer, and open-state controls. It opens from the bottom edge. Drag its handle down to dismiss it. Keyboard users can use the button named by `closeLabel` or press Escape. `swipeToClose={false}` removes the handle. **Dialog** and **Sheet** accept `initialFocusRef` and `footer`. Choose `compact`, `regular`, or `wide` for `size`. Sheet's `side` follows reading direction. [Dialog pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

**Popover** opens a non-modal panel from `trigger` and accepts `title`, `closeLabel`, and `children`. Focus moves into the panel. Tab traverses its controls and can leave. Escape returns to the button. **HoverCard** attaches a short preview to a term using `trigger`, `title`, and `children`. Focus reveals the text immediately. A pointer waits `delay` milliseconds, and a tap pins the card. A second tap, Escape, or leaving the group closes it. **Tooltip** allows the same interval for pointer travel between the trigger and its text. Its content is a string associated with the trigger by `aria-describedby`.

## Space and navigation

**Resizable** splits `first` and `second` into two panels. Give the separator a `label` that identifies the first panel. `min`, `max`, `defaultValue`, and `value` are percentages of the available space. Drag the separator or use the arrows along its axis. Shift multiplies the step by five. Home and End reach the limits. Enter toggles between the minimum and the last size. `orientation="vertical"` stacks the panels. [Window splitter pattern](https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/)

**Carousel** presents a manually advanced series of `items`, each with `value`, `label`, and `content`. `previousLabel` and `nextLabel` name its buttons. A change announces the position and the name of the item. On touchscreens, swipe horizontally to change slides. Keyboard users can use the buttons or press the arrows while the region has focus. [Carousel pattern](https://www.w3.org/WAI/ARIA/apg/patterns/carousel/)

**Tabs** offers `activation="manual"` for expensive panels. Arrows move focus and Enter or Space activates the panel. **Accordion** can keep one section open with `collapsible={false}`. **Toast** stays visible until dismissed unless you set `duration` in milliseconds. Its timer pauses while the pointer or focus is on the toast and while the page is hidden.
