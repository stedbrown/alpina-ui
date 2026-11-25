import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import './icon.css'

// Each drawing occupies the same 24-unit sign square. The two-unit stroke
// puts the edges of horizontal and vertical rules on whole coordinates.
const paths = {
  'arrow-right': 'M3 12H20 M13 5L20 12L13 19',
  'arrow-left': 'M21 12H4 M11 5L4 12L11 19',
  'arrow-up-right': 'M5 19L19 5 M8 5H19V16',
  'chevron-down': 'M5 9L12 16L19 9',
  'chevron-right': 'M9 5L16 12L9 19',
  plus: 'M4 12H20 M12 4V20',
  minus: 'M4 12H20',
  close: 'M5 5L19 19 M19 5L5 19',
  check: 'M3 12L9 18L21 6',
  search: 'M16 10A6 6 0 1 1 4 10A6 6 0 1 1 16 10Z M14.5 14.5L21 21',
  copy: 'M8 8H20V21H8Z M4 16V3H15',
  download: 'M12 3V15 M7 10L12 15L17 10 M4 16V21H20V16',
  'external-link': 'M10 5H4V20H19V14 M13 3H21V11 M11 13L21 3',
  menu: 'M3 5H21 M3 12H21 M3 19H16',
  filter: 'M3 4H21V6L14 13V19L10 21V13L3 6Z',
  sort: 'M6 4V20 M3 17L6 20L9 17 M12 5H21 M12 11H18 M12 17H15',
  grid: 'M3 3H10V10H3Z M14 3H21V10H14Z M3 14H10V21H3Z M14 14H21V21H14Z',
  list: 'M3 5H5 M10 5H21 M3 12H5 M10 12H18 M3 19H5 M10 19H21',
  table: 'M3 4H21V20H3Z M3 9H21 M3 15H21 M9 9V20',
  sliders: 'M3 7H8 M14 7H21 M8 4H14V10H8Z M3 17H13 M19 17H21 M13 14H19V20H13Z',
  calendar: 'M3 6H21V21H3Z M3 11H21 M7 3V8 M17 3V8 M7 16H10',
  clock: 'M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12Z M12 6V12L16 14',
  document: 'M5 3H14L20 9V21H5Z M14 3V9H20 M9 13H16 M9 17H13',
  folder: 'M3 5H10L13 8H21V20H3Z M3 10H9',
  book: 'M2 4H7L12 6L17 4H22V18H17L12 20L7 18H2Z M12 6V20',
  code: 'M7 7L2 12L7 17 M17 7L22 12L17 17 M14 4L10 20',
  'git-branch': 'M7 8V16 M7 14H11L17 8 M9.5 5.5A2.5 2.5 0 1 1 4.5 5.5A2.5 2.5 0 1 1 9.5 5.5Z M9.5 18.5A2.5 2.5 0 1 1 4.5 18.5A2.5 2.5 0 1 1 9.5 18.5Z M21 6A2.5 2.5 0 1 1 16 6A2.5 2.5 0 1 1 21 6Z',
  'git-commit': 'M2 12H7 M17 12H22 M17 12A5 5 0 1 1 7 12A5 5 0 1 1 17 12Z',
  repository: 'M5 3H20V21H5Z M5 17H20 M9 3V11L11.5 9L14 11V3',
  star: 'M12 2.8L14.7 9L21.5 9.6L16.3 14.1L17.9 20.8L12 17.3L6.1 20.8L7.7 14.1L2.5 9.6L9.3 9Z',
  'map-pin': 'M12 21L6.5 14.5A7.2 7.2 0 1 1 17.5 14.5Z M14.5 9.5A2.5 2.5 0 1 1 9.5 9.5A2.5 2.5 0 1 1 14.5 9.5Z',
  info: 'M21 12A9 9 0 1 1 3 12A9 9 0 1 1 21 12Z M12 7V7.4 M10 11H12V17 M10 17H14',
}

export type IconName = keyof typeof paths
export const iconNames: readonly IconName[] = Object.freeze(Object.keys(paths) as IconName[])

export interface IconProps extends Omit<ComponentPropsWithoutRef<'svg'>, 'name' | 'children' | 'viewBox'> {
  name: IconName
  /** The width and height of the sign square. Accepts CSS lengths such as "1em". */
  size?: number | string
  /** A short accessible name when the icon carries meaning on its own. */
  label?: string
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon(
  { name, size = 24, label, 'aria-label': ariaLabel, 'aria-labelledby': labelledBy, className = '', ...props },
  ref,
) {
  const accessibleLabel = label?.trim() || ariaLabel?.trim()
  const named = Boolean(accessibleLabel || labelledBy?.trim())
  return (
    <svg
      ref={ref}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      strokeMiterlimit={2}
      focusable="false"
      role={named ? 'img' : undefined}
      aria-hidden={named ? undefined : true}
      aria-label={accessibleLabel || undefined}
      aria-labelledby={labelledBy}
      {...props}
      className={('al-icon ' + className).trim()}
    >
      <path d={paths[name]} />
    </svg>
  )
})
