---
name: alpina-ui
description: Build or update React interfaces with Alpina UI. Use this skill to choose components, check their installed TypeScript contracts, compose the Swiss typographic grid, and localize Swiss forms and formats.
license: MIT
---

# Work with Alpina UI

Start with the version used by the application. Package imports and editable component copies are both supported. Follow the convention already present in the project.

For a new project install the publicly hosted release archive. The URL pins the version in the application's lockfile.

```sh
npm install https://alpinaui.com/alpina-ui-1.0.0-rc.5.tgz
```

The public index links to the installation guide, component registry and Markdown guides. [Alpina agent index](https://alpinaui.com/llms.txt)

## Find the actual API

- Use the local MCP server when the component name, props or installed version are uncertain. Start with `search_components({ query: "invoice" })`. Use the returned identifier with `get_component({ name: "invoice-document" })` to read its import path and TypeScript declaration. Call `get_guide({})` for available guide slugs, then request the workflow you need, for example `get_guide({ slug: "qr-bill" })`. Request a listed source file when a type extends a shared interface. For example, the item type for `dropdown-menu` inherits its action fields from `interactive/action-list.tsx`.
- Without MCP, use `npx --no-install alpina list` in the application. The installed package includes `registry.json`, declarations under `dist/`, editable sources under `src/`, and English Markdown under `docs/`. Use the installed declarations to check prop names, subcomponents, and controlled state.
- For a packaged application, import the full stylesheet once at its entry point with `import "alpina-ui/styles.css"`. If the project copies source, preview dependencies with `npx --no-install alpina add <component> --dry-run`. After a package upgrade, `alpina diff` identifies locally edited copies.

## Compose the interface

Use paper, ink and one red accent. Give red a job, such as identifying the current section or the primary action. Use a solid field for a change of section. Keep headings and reading text flush left, align them to the same column edges, and align money at the decimal edge. Use empty columns or vertical space to separate tasks. A page may open with a large heading beside a short measure of text, then change scale to a full-width ledger.

Use `Grid` and `GridItem` when elements must align to shared columns. Use `Stack` for a group whose spacing, direction, baseline alignment, or wrapping should hold as labels change length. Use `Typography`'s element and visual variant separately so heading order follows the document. Look up the `design` guide for Alpina’s type roles, spacing unit, and 4/8/12-column behavior.

For an action menu followed by a confirmation dialog, keep the menu trigger reference and restore focus when the dialog closes. The bilingual address book on the Examples page shows how focus moves after a record is deleted.

Use `Icon` for interface symbols. The installed `iconNames` export lists the supported names. Keep the icon decorative next to visible text and put the accessible name on an icon-only button or link.

## Four common tasks

Set `AlpinaProvider locale="it-CH"` at the application boundary so fields, validation and portals share a language. Use a component-level locale for an intentional bilingual preview. Set the document's `lang` and translate your own content separately.

For a workspace with persistent navigation, pass a `SideNav` to the `sidebar` prop of `AppShell`, and supply its brand and mobile navigation labels. Mount one `Toaster` with a localized `closeLabel` and call `toast(message)` from the browser event that completes an action. A persistent field error belongs in the form.

To compare periods in a chart, give `BarChart` or `LineChart` a `series` array. Each series has a `name` and `data` points with the same category labels. Supply a title, description and meaningful table labels so the same comparison reads well without the graphic.

### Print an invoice with a QR payment slip

For a grouped invoice number, `createQrReference('2026-0141', { stripSeparators: true })` preserves its digits. For an alphanumeric identifier and an ordinary IBAN, use `createCreditorReference('INV-2026-0141', { stripSeparators: true })`. Keep long identifiers as strings.

Pass structured creditor and debtor addresses in `payment`. Pair a QR-IBAN with a QRR reference. With an ordinary IBAN, supply a valid SCOR reference or omit the reference. The invoice derives the payable amount from the VAT-exclusive lines. Pass the mounted article to `printSwissDocument` to print this invoice from an application page.

```tsx
'use client'
import { useRef } from 'react'
import { Button, InvoiceDocument, printSwissDocument, type InvoiceDocumentProps } from 'alpina-ui'

export function Invoice({ payment }: Pick<InvoiceDocumentProps, 'payment'>) {
  const article = useRef<HTMLElement>(null)
  return <>
    <InvoiceDocument ref={article} payment={payment} invoiceNumber="2026-0141"
      issueDate="2026-11-25" supplyDate="2026-11-24" dueDate="2026-12-25"
      vatNumber="CHE-109.322.551" locale="it-CH"
      lines={[{ description: 'Repair', quantity: '2.5', unit: 'h', unitPrice: '80.00', vatRate: 8.1 }]} />
    <Button onClick={() => { if (article.current) printSwissDocument(article.current) }}>Print invoice</Button>
  </>
}
```

### Collect an AHV number and a postal address

Spread the object from the `Field` render function onto its input. It carries the control ID and the associations for its label, hint and error. Keep the submission name on the input.

```tsx
import { Field, Input } from 'alpina-ui'

export function ContactEmail({ error }: { error?: string }) {
  return <Field label="Email" description="We will send the receipt here." error={error}>
    {control => <Input {...control} name="email" type="email" autoComplete="email" required />}
  </Field>
}
```

Use one form. `SwissAddressFields` supplies a fieldset and named controls. The server receives the formatted AHV string under `ahv` and can validate it with `ahvSchema('it-CH')['~standard'].validate(data.get('ahv'))`. Map the submitted address to the eCH format expected by the service and handle validation errors on the server. The `validation` guide documents the schema's output.

```tsx
'use client'
import { AhvInput, Button, Field, SwissAddressFields } from 'alpina-ui'

export function ResidenceForm() {
  return <form method="post" action="/residence">
    <Field label="Numero AVS">{control => <AhvInput {...control} name="ahv" locale="it-CH" required />}</Field>
    <SwissAddressFields locale="it-CH" format="ech-person" />
    <Button type="submit">Invia richiesta</Button>
  </form>
}
```

### Build an accounting table

Use typed accounting columns for numeric sorting and exact centime totals. Pass decimal values from the data source. In a standalone label, `formatCHF(1250, 'fr-CH')` already includes “CHF”. The locale is the second positional argument. A third options argument can request cash rounding.

```tsx
import { DataTable } from 'alpina-ui'

const entries = [
  { invoice: '2026-0141', net: '200.00' },
  { invoice: '2026-0142', net: '-12.50' },
]
export function Accounts() {
  return <DataTable rows={entries} rowKey={row => row.invoice} locale="fr-CH"
    caption="Journal des ventes" empty="Aucune écriture" totalLabel="Total" negativeStyle="parentheses"
    columns={[
      { id: 'invoice', header: 'Facture', cell: row => row.invoice, nowrap: true },
      { id: 'net', header: 'Net', format: 'chf', value: row => row.net, aggregate: 'sum' },
    ]} />
}
```

### Offer appointment dates with cantonal holidays

The canton determines the closure schedule and the locale determines its language. Use `statutory` for the legal rest-day schedule or `common` for the documented customary office closures. `disableHolidays` prevents selection of observed holidays. Store the civil date returned by `onValueChange` as `YYYY-MM-DD`.

```tsx
'use client'
import { Calendar } from 'alpina-ui'

export function Appointments({ choose }: { choose: (day: string) => void }) {
  return <Calendar canton="AG" locale="de-CH" observance="common" disableHolidays
    defaultMonth="2027-03" onValueChange={choose} />
}
```
