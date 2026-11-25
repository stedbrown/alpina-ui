# Interactive components

These React components use labels supplied by the application. Pass strings in your interface language to `label`, `triggerLabel`, and `closeLabel`. Each component accepts `className`.

## Dialogs and panels

`Dialog` opens a centered window. `Sheet` opens a side panel with the same API. Both call `showModal()` on the HTML `dialog` after mounting. The browser makes the rest of the page inert and handles focus restoration to the control that opened the window. [HTML dialog specification](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element)

| Prop | Purpose |
| --- | --- |
| `title: ReactNode` | Visible title and accessible name of the dialog. |
| `closeLabel: string` | Accessible name of the × button. |
| `description?: ReactNode` | Short description associated through `aria-describedby`. Place long or structured material in the children. |
| `trigger?: ReactNode` | Text or icon inside the trigger button. The component creates the button. |
| `triggerLabel?: string` | Accessible name for an icon-only trigger. |
| `children?: ReactNode` | Dialog content. |
| `open?`, `defaultOpen?`, `onOpenChange?(open: boolean)` | Pass `open` and the callback to manage state externally. Use `defaultOpen` to initialize internal state. |
| `side?: "start" \| "end"` | Logical side for `Sheet`. Defaults to `end`. |

Escape, ×, and clicking the backdrop request closure. A drag started inside the dialog leaves it open. For a form that needs a specific entry point, set `autoFocus` on the initial field and check the reading order.

```tsx
import { useState } from "react"
import { Dialog } from "alpina-ui/interactive/dialog"
import { Toast } from "alpina-ui/interactive/toast"

export function Preferences() {
  const [open, setOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  return (
    <>
      <Dialog open={open} onOpenChange={setOpen} trigger="Edit office"
        title="Preferred office" closeLabel="Close" description="Choose the office to suggest on new forms.">
        <form onSubmit={event => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          localStorage.setItem("office", String(form.get("office")))
          setOpen(false)
          setSaved(true)
        }}>
          <label>Office <select name="office" defaultValue="Lugano">
            <option>Lugano</option><option>Bern</option>
          </select></label>
          <button type="submit">Save</button>
        </form>
      </Dialog>
      <Toast open={saved} onOpenChange={setSaved} tone="success" closeLabel="Dismiss confirmation">
        Preferred office saved.
      </Toast>
    </>
  )
}
```

## Tabs and expandable sections

Give each item a unique, stable `value`. Panels stay mounted during navigation and retain their local state.

| Component | API |
| --- | --- |
| `Tabs` | `label: string`, `items: { value, label, content, disabled? }[]`, `value?: string`, `defaultValue?: string`, `onValueChange?(value: string)`, `orientation?: "horizontal" \| "vertical"`. Item `label` and `content` accept React nodes. |
| `Accordion` | `items: { value, title, content, disabled? }[]`, `value?: string \| null`, `defaultValue?: string \| null`, `onValueChange?(value: string \| null)`, `headingLevel?: 2 \| 3 \| 4 \| 5 \| 6`. `title` and `content` accept React nodes. |

`Tabs` activates the tab reached with the horizontal or vertical arrows, according to its orientation. Home and End reach the first and last enabled tabs. Tab enters through the selected tab and continues to the panel. If the selected value leaves the list, the first enabled tab is shown. [WAI-ARIA tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)

`Accordion` expands one section at a time. Enter or Space toggles a section. Up, Down, Home, and End move focus among headings. A `null` value collapses all sections. Match `headingLevel` to the page hierarchy.

```tsx
<Tabs label="Offices" defaultValue="be" items={[
  { value: "be", label: "Bern", content: <p>Bundesplatz, Bern</p> },
  { value: "ti", label: "Lugano", content: <p>Piazza della Riforma, Lugano</p> },
]} />
```

## Action menus

`DropdownMenu` accepts `label` and an `items` array. Each item needs a stable `value` and a text `label`. When a page has several menus, use `triggerLabel` to identify the contact in each button's accessible name. `open`, `defaultOpen`, and `onOpenChange` control the open state. Selecting an action closes the menu and returns focus to the button. The item's `onSelect()` runs before the menu's `onValueSelect(value)`.

| Option | Effect |
| --- | --- |
| `align` | Aligns the panel to the logical side of the button, taking text direction and available space into account. Accepts `start` (default) or `end`. |
| `size="compact"` | At the default scale, reduces the button height from 44 to 32 px with a fine pointer. With a primary touch pointer the target is at least 44 × 44 px. The default size is `regular`. |
| `item.separatorBefore` | Inserts a divider above the item and preserves continuous keyboard navigation. A divider before the first item is skipped. |
| `item.tone="danger"` | Combines red with a circled minus and a heavier font weight. Give the action an explicit name. |
| `item.disabled` | Keeps an item reachable with the arrows and prevents activation. |

Enter, Space, and Down Arrow open the menu on its first item. Up Arrow opens it on the last and scrolls that item into view. Arrows, Home, End, and initial letters move focus. Escape returns to the button and Tab continues to the next control. If the button scrolls entirely out of its panel, the menu closes. On browsers supporting the Popover API, the menu uses the document's top layer to escape container clipping. [WAI-ARIA menu button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/)

```tsx
<DropdownMenu
  label="Actions"
  triggerLabel={`Actions for ${contact.name}`}
  align="end"
  size="compact"
  items={[
    { value: "edit", label: "Edit contact", onSelect: editContact },
    {
      value: "remove",
      label: "Delete contact…",
      separatorBefore: true,
      tone: "danger",
      onSelect: openDeleteConfirmation,
    },
  ]}
/>
```

## Messages and hints

| Component | API and behavior |
| --- | --- |
| `Toast` | Requires `open: boolean`, `onOpenChange(open: boolean)`, `closeLabel: string`, and `children: ReactNode`. `tone` accepts `neutral`, `success`, and `danger`. `urgency` accepts `polite` or `assertive`. |
| `Tooltip` | Requires `content: string` and one keyboard-focusable child control that forwards `aria-describedby` to the DOM. Existing description IDs are preserved. |

Keep `Toast` mounted and change `open` to display it. Its live region remains present between announcements. By default the message stays visible until dismissed and keeps focus on the main task. Place it near the action that generated it.

`Tooltip` appears on hover or focus and closes on Escape. Use it for supplementary details. Give the action a name that also makes sense on a touchscreen.

```tsx
<Tooltip content="Opens the user manual">
  <button type="button" onClick={openManual}>Help</button>
</Tooltip>
```

## Browser verification

After `npm ci`, run `node tests/interactive.browser.mjs` from the project directory. The script uses the Playwright Chromium installation if available, then falls back to an installed copy of Chrome. Set `CHROME_PATH` to select another executable. The suite runs React in Strict Mode and exercises the seven components in a 390 px viewport.

For confirmations that originate anywhere on a long page, mount one `<Toaster closeLabel="Dismiss notification" />` at the application root. From a browser event, call `const dismiss = toast('Booking confirmed', { tone: 'success' })`. Notifications appear one at a time above the device safe area. Each waits for dismissal unless a duration is supplied. Call `dismiss()` to remove that message, including while it is queued.

Use the inline `Toast` beside a specific control when readers need to revisit its feedback in document order. Both presentations keep focus on the current task and announce messages through a live region.
