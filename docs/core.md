# Core components

The core components cover typography, grids, forms, tables, containers, status indicators, and navigation. The examples import components from the package and assume your app already loads `alpina-ui/styles.css`. If you copied the source with the CLI, import from your local paths instead. Each TSX file imports its own CSS.

## Theme and visual states

Black and white form the reading surface. Red (`#EB0000`) identifies primary actions, the current item, and errors accompanied by text. Focus outlines use the theme's ink color. Dividing rules use transparent ink. Override tokens on an application container.

| Variables | Use |
| --- | --- |
| `--al-bg`, `--al-surface`, `--al-soft`, `--al-hover` | Page, panels, secondary fills, and pointer hover. |
| `--al-ink`, `--al-muted` | Primary text, descriptions, and hints. |
| `--al-line`, `--al-control` | Content dividers and control outlines. |
| `--al-accent`, `--al-on-accent`, `--al-accent-hover`, `--al-focus` | Actions, text on the accent, primary action hover, and focus. |
| `--al-success`, `--al-warning`, `--al-danger` | Application states accompanied by a label or message. |
| `--al-font`, `--al-display`, `--al-mono` | Body and headings share the Helvetica Neue, Helvetica, Arial stack, with the system sans serif as fallback. The monospace token is available for code and technical references. |
| `--al-unit`, `--al-space-1`…`--al-space-12`, `--al-space-16` | The module is 0.25 rem. The number indicates the number of modules. For example, `--al-space-3` is 12 px at a 16 px root. |
| `--al-type-*`, `--al-leading-*` | Each role has its own font size and line height. At a 16 px root, the scale in pixels is caption 12/16, label 14/20, body 16/24, heading 24/28, display 48/48, and display-lg 64/64. |
| `--al-radius`, `--al-shadow`, `--al-shadow-raised` | Base corner radius, control elevation, and overlay shadows. |

At a 16 px root, the standard button and input fields are at least 44 px high. Checkbox, radio, and compact button targets grow on devices with a coarse pointer. The spinner advances in eight steps and stops when reduced motion is requested. Its associated text remains available to screen readers.

## Controls and forms

### Compose a link with Alpina

`asChild` places the component's styling, attributes and ref on one child element. Use a link to navigate and a native button to perform an action. A custom link must pass its received props and ref to its anchor.

```tsx
import Link from 'next/link'
import { Button, TextLink } from 'alpina-ui'
import { Link as RouterLink } from 'react-router'

<Button asChild><Link href="/invoices">View invoices</Link></Button>
<TextLink asChild><RouterLink to="/account">Account settings</RouterLink></TextLink>
```

`Badge` also accepts `asChild`. The child keeps its classes alongside the Alpina class. Child and parent event handlers can both participate in the interaction. Put navigation attributes such as `to` or `href` on the child.

For a breadcrumb or navigation entry, set `asChild: true` and supply the link as its `label`. Keep the navigation entry's `href` for identification. A dropdown, context menu or menubar action can use the same pattern. Give a complex action label a `textValue` for keyboard typeahead.

The HTML props below belong to the underlying element and include ARIA attributes, events, and `className`. Text and select controls support native `value`/`onChange` or `defaultValue`. Checkboxes and switches use `checked`/`onChange` or `defaultChecked`. Button, Input, Textarea, Select, Checkbox, and Switch forward their `ref` to the HTML node.

| Export | Props and defaults | Use |
| --- | --- | --- |
| `Button` | Native `button` props. `variant` accepts `primary` (default), `secondary`, `outline`, `ghost`, or `danger`. `size` accepts `sm`, `md` (default), or `lg`. | Defaults to `type="button"`. Use `type="submit"` to submit a form. Give icon-only buttons an accessible name. |
| `Input` | Native `input` props. Defaults to type `text`. | Supports native types such as `email`, `date`, and `number`, with `name`, `autoComplete`, `required`, and browser constraints. |
| `Textarea` | Native `textarea` props. `rows` defaults to 3. | Set its initial height with `rows` and its maximum length with `maxLength`. |
| `Select` | Native `select` props with `option` or `optgroup` children. | The browser handles keyboard navigation, type-ahead, and mobile selection. |
| `Checkbox` | Native `input` props with its type fixed to `checkbox`. | Associate a label. Set `value` to submit a particular value with the form. |
| `Switch` | Native `input` props with type `checkbox` and role `switch`. | Represents a binary state. Keep the label stable when the state changes, for example “Email notifications.” |
| `RadioGroup` | `label: ReactNode`, `options: readonly RadioOption[]`, `value?`, `defaultValue?`, `onValueChange?(value)`, `required?`, and `fieldset` props except `children` and `onChange`. | Each option has a unique `value: string`, `label: ReactNode`, and optional `disabled?: boolean`. The group generates a shared name or accepts `name`. Supply a stable name to serialize form data. |
| `Field` | `label: ReactNode`, `children(control): ReactNode`, `id?`, `description?`, `error?`, `describedBy?: string`, and `div` props. | The callback receives `FieldControlProps`. Spread `{...control}` onto the control. An optional `id` identifies it. `describedBy` adds space-separated external IDs to those of the hint and error. |

### Associate a form error with its field

Clicking the label focuses the field. When the email address is invalid, Field connects the hint and error to the input and sets `aria-invalid`. The calling component chooses when to show an error and what to do with valid data.

```tsx
import { useState } from "react"
import { Button, Field, Input, Select } from "alpina-ui"

export function ContactForm({ onSave }: { onSave: (data: FormData) => void }) {
  const [error, setError] = useState("")
  return (
    <form onSubmit={event => {
      event.preventDefault()
      onSave(new FormData(event.currentTarget))
    }}>
      <Field label="Email address" description="Your confirmation will be sent here." error={error}>
        {control => (
          <Input {...control} name="email" type="email" autoComplete="email" required
            onInvalid={() => setError("Enter a valid email address.")}
            onInput={event => {
              if (event.currentTarget.validity.valid) setError("")
            }} />
        )}
      </Field>
      <Field label="Contact language">
        {control => (
          <Select {...control} name="language" defaultValue="it">
            <option value="it">Italiano</option>
            <option value="de">Deutsch</option>
            <option value="fr">Français</option>
          </Select>
        )}
      </Field>
      <Button type="submit">Save contact</Button>
    </form>
  )
}
```

## Containers, status, and navigation

| Export | Props and defaults | Use |
| --- | --- | --- |
| `Badge` | Native `span` props. `tone` accepts `neutral` (default), `accent`, `success`, or `danger`. | Include text that identifies the state when colors are unavailable. |
| `Card` | Native `div` props. `CardHeader`, `CardContent`, and `CardFooter` also accept `div` props. | Compose the sections you need. |
| `CardTitle`, `CardDescription` | Title accepts heading props and `as` from `h1` to `h6`, defaulting to `h2`. Description accepts `p` props. | Choose a heading level that fits your page structure. |
| `Alert` | Native `div` props, `title?: ReactNode`, and `children`. `tone` accepts `info` (default), `success`, `warning`, or `danger`. | Use `role="status"` for a dynamic update and reserve `role="alert"` for urgent messages. |
| `Table`, `TableCaption` | Native `table` and `caption` props. | A caption describes the purpose of the table. |
| `TableHeader`, `TableBody`, `TableFooter`, `TableRow` | Native `thead`, `tbody`, `tfoot`, and `tr` props. | Preserve the native HTML hierarchy of sections and rows. |
| `TableHead`, `TableCell` | Native `th` and `td` props. `TableHead` defaults to `scope="col"`. | Use `scope="row"` for a row heading. |
| `DataTable<Row>` | `rows`, `columns`, `rowKey`, `caption`, `empty`, `sort?`, `defaultSort?`, and `onSortChange?`. | Builds a table from data and sorts columns that provide comparators. |
| `Separator` | Native `div` props except `children` and `role`. `orientation` accepts `horizontal` (default) or `vertical`. `decorative` defaults to `true`. | Set `decorative={false}` when the separation should be announced. |
| `Progress` | `label: string`, `value?: number`, `max?: number` (default 100), and other `progress` props. | Omit `value` when duration is unknown. Finite values are clamped between zero and `max`. |
| `Spinner` | `label?: string` and native `span` props except `children`. | A label exposes a text status. Beside visible loading text, omit `label` to keep the spinner decorative. |
| `Skeleton` | Native `div` props except `children`. | Set its size with `className` or `style` and mark the updating container `aria-busy`. The placeholder is decorative. |
| `Breadcrumb` | `label: string`, `items: readonly BreadcrumbItem[]`, and other `nav` props except `children`. | Each item takes `label: ReactNode` and `href?: string`. The last item receives `aria-current="page"`. |
| `Pagination` | `label: string`, `items: readonly PaginationItem[]`, `currentPage: number`, and other `nav` props except `children`. | Each item has a unique `page`, an `href`, and optional `label?: ReactNode` and `accessibleLabel?: string`. Supply real URLs and include the current page. |

Each component exports a corresponding type with the suffix `Props`. The package also exports `RadioOption`, `FieldControlProps`, `DataColumn<Row>`, `DataSort`, `BreadcrumbItem`, and `PaginationItem`.

### Sort amounts in Swiss francs

This table displays amounts in Swiss Italian. The comparator uses integer centimes from each record, so 8 francs sorts before 120 francs regardless of the displayed symbols, spacing, or separators.

```tsx
import { CurrencyCHF, DataTable, type DataColumn } from "alpina-ui"

type Invoice = { id: string; cents: number }

const columns: DataColumn<Invoice>[] = [
  { id: "id", header: "Invoice", cell: row => row.id },
  {
    id: "amount", header: "Amount", align: "end",
    cell: row => <CurrencyCHF amount={row.cents / 100} locale="it-CH" />,
    compare: (a, b) => a.cents - b.cents,
  },
]

export function Invoices({ rows }: { rows: readonly Invoice[] }) {
  return (
    <DataTable rows={rows} columns={columns} rowKey={row => row.id}
      caption="Quarterly invoices" empty="No invoices this quarter."
      defaultSort={{ column: "amount", direction: "ascending" }} />
  )
}
```

| `DataTableProps<Row>` property | Behavior |
| --- | --- |
| `rows: readonly Row[]` | Keeps the supplied order until sorting is applied. Sorts a copy and preserves the order of equivalent rows. |
| `columns: readonly DataColumn<Row>[]` | Each column requires a unique `id`, a text `header`, and `cell(row): ReactNode`. `align` accepts `start` or `end`. Supply `compare(a, b)` to enable sorting. Return a negative number, zero, or a positive number. |
| `rowKey(row): Key` | Returns a stable, unique React key such as an invoice ID. |
| `caption: string`, `empty: ReactNode` | The caption identifies the table and its scrollable region. The empty message spans all columns. |
| `defaultSort?: DataSort` | For internal state, set the initial sort with `{ column, direction }`. `column` must identify a sortable column. |
| `sort?: DataSort \| null`, `onSortChange?(next: DataSort)` | Pass `sort` and update it in the callback to control sorting. `null` keeps the order of the supplied rows. The callback also receives changes in uncontrolled mode. |

Directions are `ascending` and `descending`. The first click on a new column sorts ascending. Subsequent activations alternate directions. Enter and Space activate the header buttons. The active header exposes `aria-sort`. The visual arrows are decorative.

### A card with a table and pagination

```tsx
import {
  Badge, Card, CardContent, CardFooter, CardHeader, CardTitle, Pagination,
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "alpina-ui"

export function Reservations() {
  return (
    <Card>
      <CardHeader><CardTitle>Reservations</CardTitle></CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Saturday departures</TableCaption>
          <TableHeader><TableRow><TableHead>Route</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody><TableRow>
            <TableHead scope="row">Lugano – Locarno</TableHead>
            <TableCell><Badge tone="success">Confirmed</Badge></TableCell>
          </TableRow></TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <Pagination label="Reservation pages" currentPage={1} items={[
          { page: 1, href: "?page=1", accessibleLabel: "Page 1" },
          { page: 2, href: "?page=2", accessibleLabel: "Page 2" },
        ]} />
      </CardFooter>
    </Card>
  )
}
```

## Keyboard and assistive technology

- Arrow keys change the selection in a native radio group. Space activates a native switch or checkbox.
- Use Field or an associated HTML `label` for an individual control. Use the group legend for radio buttons. Translate labels, messages, and navigation region names into the interface language.
- Spinner and Skeleton respect `prefers-reduced-motion`. Provide readable text for the outcome of an operation.
- If you customize the theme colors, check the contrast of text, borders, and focus indicators. Test the entire form using only the keyboard, including error correction.
