import { additions as elements } from './additions-elements.mjs'
import { additions as actions } from './additions-actions.mjs'
import { additions as workflows } from './additions-workflows.mjs'
import { additions as portal } from './additions-portal.mjs'
export const additions = [
  ...elements,
  ...actions,
  ...workflows,
  ...portal,
  ['ui', 'description-list', 'DescriptionList', 'Read-only details', 'Navigation and data', 'Pair labels with values in a responsive order, address or invoice summary.'],
  ['ui', 'figure', 'Figure', 'Captioned figure', 'Graphic design', 'Keep an image or specimen with its caption and source.'],
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
