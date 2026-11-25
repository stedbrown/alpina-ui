import { additions as elements } from './additions-elements.mjs'
import { additions as actions } from './additions-actions.mjs'
import { additions as workflows } from './additions-workflows.mjs'
import { additions as portal } from './additions-portal.mjs'
export const additions = [
  ['swiss', 'multilingual-field', 'MultilingualField', 'Multilingual text', 'Swiss localization', 'Edit translations for all four national languages with character counts and per-language form values.'],
  ['swiss', 'iban-input', 'IbanInput', 'Swiss bank account', 'Swiss localization', 'Validate CH and LI accounts and group the IBAN in fours.'],
  ['swiss', 'ahv-input', 'AhvInput', 'AHV number', 'Swiss localization', 'Check the Swiss social insurance number and its EAN‑13 checksum.'],
  ['swiss', 'phone-input', 'PhoneInput', 'Swiss telephone number', 'Swiss localization', 'Accept domestic and international input and display a Swiss +41 number.'],
  ['swiss', 'uid-input', 'UidInput', 'Swiss business identifier', 'Swiss localization', 'Validate and format the nine digits of a Swiss CHE business identifier.'],
  ['swiss', 'letter', 'Letter', 'Swiss business letter', 'Swiss localization', 'Print correspondence on A4 with the Swiss left or right address window and folding marks.'],
  ['swiss', 'invoice-document', 'InvoiceDocument', 'Swiss VAT invoice', 'Swiss localization', 'Itemize VAT-exclusive services and print the payable CHF total with a Swiss QR-bill.'],
  ['swiss', 'swiss-qr-bill', 'SwissQrBill', 'QR payment slip', 'Swiss localization', 'Prepare a SIX QR-bill payment part and receipt with a scannable Swiss QR Code.'],
  ['ui', 'bar-chart', 'BarChart', 'Horizontal bar chart', 'Navigation and data', 'Compare signed values on a common scale with directly labelled bars.'],
  ['ui', 'line-chart', 'LineChart', 'Time series', 'Navigation and data', 'Plot an ordered series with a labelled scale and a readable data table.'],
  ['ui', 'sparkline', 'Sparkline', 'Compact trend', 'Navigation and data', 'Show a short trend with its last observation and the underlying values.'],
  ['ui', 'chart-table', 'ChartTable', 'Table with bars', 'Navigation and data', 'Compare magnitudes while reading precise values in a semantic table.'],
  ...elements,
  ...actions,
  ...workflows,
  ...portal,
  ['ui', 'description-list', 'DescriptionList', 'Read-only details', 'Navigation and data', 'Pair labels with values in a responsive order, address or invoice summary.'],
  ['ui', 'figure', 'Figure', 'Captioned figure', 'Graphic design', 'Keep an image or specimen with its caption and source.'],
  ['ui', 'grid-overlay', 'GridOverlay', 'Baseline overlay', 'Graphic design', 'Inspect responsive columns, margins, and the four-pixel baseline without changing the layout.'],
  ['ui', 'icon', 'Icon', 'Interface icons', 'Graphic design', 'Identify an action, destination or state with an original Alpina pictogram.'],
  ['ui', 'steps', 'Steps', 'Workflow progress', 'Forms', 'Show the order of a workflow and identify the current step.'],
  [
    'ui',
    'stack',
    'Stack',
    'Flexible rows and columns',
    'Graphic design',
    'Arrange controls and actions with consistent spacing, alignment, and wrapping.',
  ],
]
// This is the public component inventory. The build derives source dependencies from imports.
export const groups = {
  ui: [
    'grid',
    'typography',
    'button',
    'badge',
    'card',
    'input',
    'textarea',
    'select',
    'checkbox',
    'radio-group',
    'switch',
    'field',
    'alert',
    'table',
    'data-table',
    'separator',
    'progress',
    'spinner',
    'skeleton',
    'breadcrumb',
    'pagination',
  ],
  interactive: ['dialog', 'sheet', 'tabs', 'accordion', 'dropdown-menu', 'toast', 'tooltip'],
  swiss: [
    'swiss-address-form',
    'currency-chf',
    'swiss-date',
    'locale-select',
    'canton-select',
    'canton-combobox',
    'swiss-postal-code-input',
  ],
}
groups.portal = []
for (const [group, id] of additions) groups[group].push(id)
