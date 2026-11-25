import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { buildApiReference } from '../scripts/api-reference.mjs'

const api = await buildApiReference()
const property = (entry, name) => entry.props.find((prop) => prop.name === name)
test('the API index covers each published registry item and the named parts of table, card and grid', async () => {
  const registry = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
  assert.deepEqual(new Set(Object.keys(api)), new Set(registry.items.map((item) => item.name)))
  for (const parts of Object.values(api)) {
    for (const part of parts) assert.ok(part.native.length || part.props.length, part.name)
  }
  assert.equal(api.grid[0].name, 'Grid')
  assert.equal(api.grid[1].name, 'GridItem')
  assert.ok(api.table.some((part) => part.name === 'TableCaption'))
  assert.ok(api.card.some((part) => part.name === 'CardTitle'))
})
test('delegated DOM attributes are summarized and native ref types and exclusions stay precise', () => {
  const [button] = api.button
  assert.deepEqual(button.native, ["ComponentPropsWithoutRef<'button'>"])
  assert.equal(button.ref, 'HTMLButtonElement')
  assert.equal(property(button, 'size').required, false)
  assert.equal(property(button, 'size').defaultValue, "'md'")
  assert.match(property(button, 'variant').type, /'primary'.*'danger'/)
  assert.equal(property(button, 'onClick'), undefined)
  assert.match(api.slider[0].native[0], /Omit<.+, 'type'>/)
  assert.match(api['native-select'][0].native[0], /ComponentPropsWithoutRef<'select'>/)
  assert.equal(api['text-link'][0].ref, 'HTMLAnchorElement')
  assert.equal(api.label[0].native[0], "ComponentPropsWithoutRef<'label'>")
  assert.equal(api.label[0].ref, 'HTMLLabelElement')
  assert.equal(api['swiss-date'][0].ref, 'HTMLTimeElement')
  assert.equal(api['currency-chf'][0].ref, 'HTMLDataElement')
  assert.equal(api.table.find(part => part.name === 'TableCell').ref, 'HTMLTableCellElement')
})
test('inherited API, controlled state, generic data shapes and transport types survive extraction', () => {
  const [alert] = api['alert-dialog']
  assert.ok(property(alert, 'title').required)
  assert.ok(property(alert, 'description').required)
  assert.equal(property(alert, 'closeLabel'), undefined)
  assert.equal(property(alert, 'open').required, false)
  assert.equal(property(alert, 'onOpenChange').type, '(open: boolean) => void')
  const [table] = api['data-table']
  assert.equal(table.generic, 'Row')
  assert.equal(table.ref, 'HTMLDivElement')
  assert.match(property(table, 'sortHint').defaultValue, /column headings/)
  assert.equal(property(table, 'columns').type, 'readonly DataColumn<Row>[]')
  assert.match(
    table.types.find((t) => t.name === 'DataColumn').definition,
    /interface DataColumn<Row>.*compare\?: \(a: Row, b: Row\) => number/s,
  )
  const [form] = api['swiss-address-form']
  assert.ok(property(form, 'onSave').required)
  assert.equal(
    property(form, 'onSave').type,
    '(address: SwissAddress) => void | SwissAddressValidationResult | Promise<void | SwissAddressValidationResult>',
  )
  assert.match(
    form.types.find((t) => t.name === 'SwissAddressValidationResult').definition,
    /fieldErrors: Partial<Record<keyof SwissAddress, string>>/,
  )
  assert.match(form.types.find((t) => t.name === 'SwissLocale').definition, /"rm-CH"/)
  assert.match(form.types.find((t) => t.name === 'CantonCode').definition, /"ZH".*"JU"/)
  const menu = api['dropdown-menu'][0].types.find((t) => t.name === 'DropdownMenuItem')
  assert.match(menu.definition, /value: string/)
})
