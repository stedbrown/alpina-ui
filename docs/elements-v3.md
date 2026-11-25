# Typography and basic components

The edge of a column helps readers find information as content changes. In Alpina's index, a long title can wrap while a quantity at the end of the row keeps its axis. In a form, the label, control, and explanation share a starting edge.

## From poster to screen

Josef Müller-Brockmann's *Musica Viva* compositions vary between the 1958 and 1960 posters. Proportion and grouping distinguish performers, program, and venue. In Armin Hofmann's *Stadttheater Basel, Saison 60/61*, a large “t” leaves room to attach the weekly program. A stable structure accommodated changing information even in print. [Poster House, *The Swiss Grid*](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Poster House, *Stadttheater Basel*](https://collection.posterhouse.org/poster/stadttheater-basel-saison-60-61/)

In *Giselle* (1959), the legible name and the blurred dancer invite different reading speeds. Small details matter too. The top of the numeral one extends beyond the margin so its stem aligns with adjacent text. In Alpina, text elements share a starting edge while a status symbol occupies its own column. [MoMA, *Giselle*](https://www.moma.org/collection/works/6775/) · [Poster House, exhibition commentary](https://access.posterhouse.org/exhibition/swiss-grid-2/)

## Digital measurements

Numerical columns have a specific precedent. In *Ausstellung Musikinstrumente* (1962), Richard Paul Lohse aligns the right edge of the opening hours to the grid. Alpina uses this principle in tables where people compare amounts by scanning down a column. [Poster House, poster and commentary on the opening hours](https://access.posterhouse.org/exhibition/swiss-grid-2/)

Alpina's module is `0.25rem`, or 4 px at a 16 px browser root. The historical works document the compositional method. The CSS measurements belong to this library. Default line heights include 16, 20, 24, 28, and 48 px. A 14 px label sits in a 20 px line. Thin borders and glyph outlines can cross module boundaries.

- `GridItem` accepts `start={{ small: 1, medium: 2, large: 3 }}` alongside the `small`, `medium`, and `large` spans. The starting position stops at the last column that can fit the item. Breakpoints use the container width.
- `Typography measure="reading"` limits text to 65ch. `measure="narrow"` limits it to 44ch. The ch unit refers to the width of the font's zero, so the actual number of letters per line varies.
- `TableHead numeric` and `TableCell numeric` align data to the end edge and request tabular figures when the font provides them. `Input numeric` aligns amounts the same way and requests a decimal keypad. Validation depends on the field type.
- `Chart` gives every bar the same zero. Negative bars extend in the opposite direction and use hatching. An expandable table lists each category and its value. Pass `formatValue` to localize numbers and units. The chart skips non-finite observations and shows `emptyLabel` for an empty set.
- `Alert`, `Badge`, and `Marker` combine signs with text. “Archived” and “Needs review” retain their meaning when the system overrides the colors. Give each control a label in the reader's language.

## Composing a page

### Dimensions and hit areas

These dimensions assume a 16 px root. Values in rem follow the browser's typography preferences. Minimum heights allow text to occupy a second line.

| Element | Measurement and purpose |
| --- | --- |
| Button | Sizes sm, md, and lg start at 32, 44, and 48 px. With a coarse pointer, sm increases to 44 px. Toggle and the slider control reserve at least 44 px in height. |
| Checkbox and switch | A 20 px checkbox mark sits in a 24 px hit area, increasing to 44 px with a coarse pointer. A switch is 48 px wide and 32 px high with a 44 px high touch target. |
| Row text | Item uses 8 or 12 px gaps. Dates and counts use tabular figures. On a short row, metadata moves below the title. |
| Avatar and key | Avatar offers 32, 40, and 56 px squares. Kbd starts at 24 px and grows to fit names such as “Enter.” |
| Focus | Custom controls display a 2 px outline. Scrolling regions draw their indicator inside the edge to avoid clipping. |

The browser test measures the contrast of text, labels, states, and outlines in light and dark samples, including a theme applied to a nested container. It also checks the pressed state in forced colors and keyboard-only interaction. The thresholds are 4.5 to 1 for ordinary text and 3 to 1 for graphical indicators. [W3C, text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) · [W3C, non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)

### Choosing a component

| Task | Components and behavior |
| --- | --- |
| List works | `Item` accepts a title, description, and metadata. A title link provides native navigation. `Empty` describes an empty collection and accepts an action. |
| Display a plate or specimen | `AspectRatio` holds the proportions of the frame. `Attachment` presents a file as a real link that accepts `download`. |
| Enter a value with a unit | Link `Label` to the field with `htmlFor` and `id`. In `InputGroup`, associate a suffix that defines the unit with `aria-describedby`. `Slider` uses a native range input with min, max, and step. |
| Group related actions | `ButtonGroup` gives a button group a name. Each button keeps its tab stop. `Toggle` exposes `aria-pressed` and keeps the same name in both states. |
| Show messages | `Avatar` falls back to initials if an image is missing or fails to load. Use `decorative` when the name is already visible. `Message` associates the author with the time and the text in `Bubble`. `Direction` sets its container's reading direction in multilingual documents. |
| Browse details | `Collapsible` uses keyboard-accessible details/summary. `ScrollArea` is a named, focusable region. `Kbd` represents a key name. The application implements the keyboard shortcut. |

## Compatibility with 0.2

Existing prop names are preserved. The following options were introduced in 0.3.

| Components | Behavior |
| --- | --- |
| Button, Card | `busy` prevents a second activation and preserves the button text. `Card as="article"` gives a self-contained item semantic markup. |
| Checkbox, Switch, RadioGroup | `indeterminate` exposes partial selection on the native control. `stateLabels={{ on: 'Active', off: 'Paused' }}` adds visible switch states. `orientation="horizontal"` lets radio options wrap with their labels. |
| Field, Select, Textarea | Field combines hint and error IDs and removes duplicates. `Select placeholder` adds an empty option in single-select fields, including required ones. `Textarea autoGrow` follows the text where the browser supports field-sizing and uses native behavior elsewhere. |
| Progress, Skeleton, Spinner | `formatValue(value, max)` provides an accessible progress value with its unit. `Skeleton variant="text"` or `"avatar"` reserves the corresponding space. `Spinner size` selects a diameter of 16, 20, or 32 px. |
| Breadcrumb, Pagination, Separator | `currentIndex` marks an intermediate step. Pagination marks adjacent page links with prev and next. `Separator weight="section"` emphasizes a section change. |

## SVG data graphics

Choose `BarChart` to compare categories against zero, `LineChart` for an ordered series, and `Sparkline` for a compact trend with its final reading. `ChartTable` aligns each printed value and its comparison bar on the same table row. Bars share a zero baseline. Lines and sparklines use the observed range so small changes remain visible. Each takes a title, an optional description and an ordered array of finite numeric observations. Missing or non-finite values are omitted. A series with no observations displays its empty state.

```tsx
<BarChart title="Quarterly change" description="Change in passengers compared with last year."
  categoryLabel="Station" valueLabel="Passengers" data={[
    { label: 'Bern', value: 36 }, { label: 'Luzern', value: -12 },
  ]} />
```

Use `formatValue` for presentation units and `loading` while observations are outstanding. The native data disclosure exposes values and labels in reading order. With `ChartTable`, this table is the primary view.

For grouped bars or several lines on a shared scale, supply `series` with a name and ordered observations for each series. Category labels identify matching observations. Supply unique labels within each series, and order the first series as it should appear on the axis. Missing values leave a gap and display a dash in the data table.

```tsx
import { BarChart, LineChart, Stack } from 'alpina-ui'

const series = [
  { name: '2026', data: [{ label: 'Q1', value: 48 }, { label: 'Q2', value: 56 }] },
  { name: '2025', data: [{ label: 'Q1', value: 32 }, { label: 'Q2', value: 51 }] },
]
export function BookingComparison() {
  return <Stack gap={6}>
    <BarChart title="Bookings by quarter" categoryLabel="Quarter" series={series} />
    <LineChart title="Booking trend" categoryLabel="Quarter" series={series} />
  </Stack>
}
```
