import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import * as api from '../dist/index.js'

const registry = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
const guide = await readFile(new URL('../docs/coverage.md', import.meta.url), 'utf8')
const migration = await readFile(new URL('../docs/migration.md', import.meta.url), 'utf8')
// Snapshot of the official All Components section, read on 2026-11-24.
const names = [
  "Accordion",
  "Alert",
  "Alert Dialog",
  "Aspect Ratio",
  "Attachment",
  "Avatar",
  "Badge",
  "Breadcrumb",
  "Bubble",
  "Button",
  "Button Group",
  "Calendar",
  "Card",
  "Carousel",
  "Chart",
  "Checkbox",
  "Code Block",
  "Collapsible",
  "Combobox",
  "Command",
  "Context Menu",
  "Data Table",
  "Date Picker",
  "Dialog",
  "Direction",
  "Drawer",
  "Dropdown Menu",
  "Empty",
  "Field",
  "Hover Card",
  "Input",
  "Input Group",
  "Input OTP",
  "Item",
  "Kbd",
  "Label",
  "Marker",
  "Menubar",
  "Message",
  "Message Scroller",
  "Native Select",
  "Navigation Menu",
  "Pagination",
  "Popover",
  "Progress",
  "Questionnaire",
  "Radio Group",
  "Resizable",
  "Scroll Area",
  "Select",
  "Separator",
  "Sheet",
  "Sidebar",
  "Skeleton",
  "Slider",
  "Spinner",
  "Switch",
  "Table",
  "Tabs",
  "Textarea",
  "Toast",
  "Toggle",
  "Toggle Group",
  "Tooltip",
  "Trace",
  "Typography"
]
const supplemental = [
  'ahv-input', 'app-shell', 'bar-chart', 'canton-combobox', 'canton-select', 'chart-table', 'currency-chf', 'description-list', 'figure', 'grid', 'grid-overlay', 'iban-input', 'icon', 'invoice-document', 'letter',
  'line-chart', 'locale-select', 'multilingual-field', 'phone-input', 'prose', 'qr-bill-scanner', 'sparkline', 'stack', 'steps', 'swiss-address-form', 'swiss-date', 'swiss-postal-code-input', 'swiss-qr-bill', 'text-link', 'uid-input',
]

test('the 66 documented names resolve to published entries and public React exports', () => {
  const rows = [...guide.matchAll(/^\| ([^|]+?) \| `([a-z-]+)` \| `(\w+)` \| (\w+) \|$/gm)]
  assert.deepEqual(rows.map(([, name]) => name), names)
  const mappings = [...migration.matchAll(/^\| ([^|]+?) \| \[(\w+)\]\(https:\/\/alpina-ui\.vercel\.app\/docs\/components\/([\w-]+)\/\) \| (.+?) \|$/gm)]
  assert.deepEqual(mappings.map(([, name, component, slug]) => [name, slug, component]),
    rows.map(([, name, slug, component]) => [name, slug, component]))
  const installed = new Map(registry.items.map((entry) => [entry.name, entry]))
  for (const [, name, slug, component, group] of rows) {
    assert.equal(slug, name.toLowerCase().replaceAll(' ', '-'))
    const entry = installed.get(slug)
    assert.ok(entry, 'Missing registry item ' + slug)
    assert.equal(entry.entry, group + '/' + slug + '.tsx')
    assert.ok(entry.files.includes(entry.entry))
    // React.forwardRef returns an object while ordinary function components are functions.
    assert.ok(typeof api[component] === 'function' || api[component]?.$$typeof, component)
  }
  const covered = new Set(rows.map(([, , slug]) => slug))
  const extras = guide.split(/^## The \d+ additional entries /m)[1]
  const listed = [...extras.matchAll(/^\| [^|]+ \| ([^|]+) \|$/gm)]
    .flatMap(([, entries]) => [...entries.matchAll(/`([a-z-]+)`/g)].map(match => match[1])).sort()
  assert.deepEqual(listed, supplemental, 'The coverage guide lists each additional component once.')
  assert.deepEqual([...installed.keys()].filter((slug) => !covered.has(slug)).sort(), supplemental)
  assert.equal(registry.items.length, rows.length + supplemental.length)
})
