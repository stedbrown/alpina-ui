# Designing a page in the Swiss typographic tradition

In Armin Hofmann's 1959 poster for Kunsthalle Basel, four surnames occupy the space a viewer might expect to hold an image. The number of sculptors, venue, and dates complete the poster. Look at it from a distance and then up close. Type size, position, and empty space determine when each piece of information becomes legible. An interface poses the same questions. What needs to be recognized immediately? What can be read later? [Barbara Junod, *Swiss Style forever*, FDFA, May 20, 2025](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

Look at the longest surname. Hofmann splits Aeschbacher across two lines and shifts the second part to the right. Bill, much shorter, occupies a different position. Their different lengths become part of the composition. A smaller group brings the venue and dates together. The archive records a 128 × 90 cm sheet printed in two-color offset. The sheet size describes the physical object. The placement of the names records a design decision. [Hofmann poster archive, ZHdK record 02-0831 and reproduction](https://plakatarchiv.com/gestalter/Hofmann_Armin_1959-1964/documents/doc1/pdf/full.pdf)

## Two schools and several ways to use a grid

Junod traces the move from craft to method. In the applied graphic design courses started in Basel and Zurich in 1915, students also learned in workshops. Later, Zurich's trilingual *Neue Grafik* showed a practice shared by several designers. Preparing the same material in several languages makes that practice tangible. Assign each role a position, then test what happens when text length changes. [FDFA, design education and *Neue Grafik*](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

The Swiss National Library identifies qualities shared by the two schools, including structured layout, sans serif type, geometry, photography, and restrained color. The exhibition *The Swiss Grid* also documents differences. At the Basel school, Emil Ruder and Hofmann explored freer arrangements through the relationship between photography, letters, and space. Univers, developed as a coordinated family of widths and weights, gave Ruder several ways to grade the importance of text. Compare the posters in the exhibition to see how much compositions can vary within shared principles. [Swiss National Library](https://www.nb.admin.ch/en/the-international-style-1950-1970) · [Poster House, *The Swiss Grid*](https://swissgrid.posterhouse.org/)

A publication tests a method over years. Between 1958 and 1965, Richard Paul Lohse, Josef Müller-Brockmann, Hans Neuburg, and Carlo Vivarelli edited 18 issues of *Neue Grafik*. One design had to accommodate articles, images, and copy in German, English, and French. In Alpina, replace a short title with a long one, then check how easily you can find the time, the place, and the following title. [Lars Müller Publishers, *Neue Grafik* facsimile](https://www.lars-mueller-publishers.com/neue-grafiknew-graphic-designgraphisme-actuel-1958-1965)

## What designers measured

A print series might use a common sheet format. Within it, a designer constructed a grid for the material at hand. The publisher of Josef Müller-Brockmann's 1981 manual documents examples with 8 to 32 **fields**. A field is an area formed by dividing space horizontally and vertically. Two grids with the same number of fields can have different proportions. [Niggli, *Grid systems in graphic design*](https://niggli.ch/en/products/rastersysteme-fur-die-visuelle-gestaltung)

Take a timetable. The time column must comfortably fit “09.30.” A session title can span several columns and wrap. If both start on consistent axes, the eye can find the next time even when the preceding title takes two lines. An empty column separates groups. Tabular numerals help readers compare times within their column. Each measurement serves a reading task.

The SBB information system, designed from 1978 by Müller-Brockmann and Peter Spalinger, applied this principle at scale. A modular structure held together the different signs a passenger encountered along a journey. In an application, try moving from a list to a form and see how readily you can identify the title, data, action, and status message. [Junod on Swiss Federal Railways](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

## Measurements chosen for Alpina

The values below are specifications for this library. Inspect them in the specimen and override them in the theme. Pixel equivalents assume a 16 px root. The implementation uses rem to respect reading preferences.

| Role | Type size / line height | Purpose |
| --- | --- | --- |
| Caption | 12 / 16 px | Metadata, units, supporting information |
| Label | 14 / 20 px | Field or action name |
| Body | 16 / 24 px | Instructions and paragraphs |
| Section heading | 24 / 28 px | Entry point for a group |
| Display heading | 48 / 48 px | First information to recognize |

Ruder’s *Typographie* treats the space between letters, words and lines as part of reading. Alpina gives captions a 16 px line so they can sit under a field without competing with its label. The body role adds room for accents and wrapped instructions. Headings use tighter leading because their larger letters already separate the lines. Use a heading element for the document outline and choose its visual role separately. [Emil Ruder, *Typography. A Manual of Design*](https://niggli.ch/en/products/typographie)

Prose and descriptions use a ragged right edge in Switzerland’s left-to-right languages. The default reading measure is 66 zero-glyph widths. Set `--al-measure` to change it between 45ch and 75ch. Narrow surfaces still reflow to the available width. Paragraphs request pretty wrapping and headings request balanced wrapping. Language tags select the browser’s hyphenation dictionary. Optical punctuation depends on browser support. Body text uses kerning and proportional figures. Tables, dates and currency use tabular figures so units line up.

“16 / 24” means 16 px type in a 24 px line box. Three lines occupy 72 px, or 18 vertical modules of 4 px. The rhythm applies to the line boxes. Visible letter height and baseline position also depend on the metrics of the available font.

| Container width | Columns | Gutter | Margin on each side |
| --- | ---: | ---: | ---: |
| Below 36 rem | 4 | 12 px | 16 px |
| From 36 to below 54 rem | 8 | 16 px | 24 px |
| From 54 rem | 12 | 24 px | 32 px |

In a 952 px container, the largest grid allocates 64 px to the two margins and 264 px to eleven gutters. That leaves 624 px, or 52 px per column. A four-column block measures 280 px including its three internal gutters. The same arithmetic applies inside an application panel. Its container determines the grid.

## Use the grid in a project

### Choose the typeface

Alpina's default uses the installed Helvetica Neue, Helvetica or Arial. To use the same grotesque across Windows, Android and Apple devices, import the optional Inter font sheet alongside the component styles. Inter's tall lowercase letters stay legible at the 12 px caption size. Its variable weight axis covers the 400, 600 and 650 weights in Alpina's hierarchy. Table cells, CHF amounts and Swiss dates request tabular figures so changing a digit preserves its column width. [Inter project](https://rsms.me/inter/)

```tsx
import "alpina-ui/styles.css"
import "alpina-ui/fonts.css"
```

The optional sheet supplies `--al-font-family` to the existing `--al-font` token. This also sets the display typeface and works inside nested light or dark themes. Use `font-family: var(--al-font)` on your application's body to extend the choice to surrounding prose. The `data-al-page` page layout already sets this property.

Both WOFF2 files are served by the application. CSS bundlers resolve their relative URLs automatically. If you copy the CSS manually, place `fonts/inter-latin-standard-normal.woff2` and `fonts/inter-latin-ext-standard-normal.woff2` next to it in a `fonts/` directory. The Latin file covers accents used in Italian, German, French and Romansh, including **città**, **Grüezi**, **œuvre** and **bainvgnü**. The extended subset loads for additional letters such as **Ā**. The package redistributes the unmodified normal-style subsets from `@fontsource-variable/inter@5.3.0` and their SIL Open Font License 1.1. Keep the accompanying license when redistributing the files. [Fontsource Inter](https://fontsource.org/fonts/inter) · [Bundled license](https://github.com/stedbrown/alpina-ui/blob/main/src/fonts/OFL.txt)

### Display spacing

Heading, display, title and poster roles share a curve based on the actual type size. At a 16 px root and a 4 px grid unit, these are the measured settings. Tracking is the extra space per character. Leading is the distance between successive baselines.

| Type size | Tracking | Leading |
| ---: | ---: | ---: |
| 24 px | −0.52 px | 28 px |
| 32 px | −0.96 px | 36 px |
| 48 px | −1.84 px | 48 px |
| 64 px | −2.72 px | 60 px |
| 96 px | −4.48 px | 88 px |
| 128 px | −6.24 px | 116 px |
| 192 px | −9.60 px | 176 px |

Above 48 px, the line box tightens so a two-line title reads as one unit. Tracking reaches its limit at −0.05 em. Both settings scale with the root text size. Leading snaps to the current grid unit when the browser supports CSS rounding. Give the title enough width for its longest word and test accents on adjacent lines.

The optional Inter files include the weight (100–900) and optical size (14–32) axes. Display roles request automatic optical sizing, which lets the browser select the appropriate design up to the font’s maximum. Running text keeps the default text cut. The spacing curve also works with the system font stack. [Inter, optical sizes](https://rsms.me/inter/)

### Place the first elements

```tsx
import { Grid, GridItem, Typography } from "alpina-ui"
import "alpina-ui/styles.css"

export function Session() {
  return (
    <Grid>
      <GridItem small={4} medium={2} large={3}>
        <Typography as="p" variant="label">09.30 – 10.15</Typography>
      </GridItem>
      <GridItem small={4} medium={6} large={9}>
        <Typography as="h2" variant="heading">Reading a poster</Typography>
        <Typography>Typographic composition workshop</Typography>
      </GridItem>
    </Grid>
  )
}
```

`Grid` accepts `guides` to show columns and the vertical module. `GridItem` sets the span at each width. `Typography` lets you choose a visual role independently of the semantic level set by `as`. Copy these sources with `npx --no-install alpina add grid typography`.

### Compose a module in two dimensions

Müller-Brockmann illustrated how a grid could organize type and images into fields. In Alpina a field occupies adjacent columns and rows. Both axes use the same gutter. The `thirds` preset puts the lead in the first four of twelve columns and the detail in the other eight. The `five-seven` preset assigns five and seven columns. Each split activates when its **container** reaches 36rem. Both fields stack in document order in a narrower panel, even on a wide screen. Try both proportions and toggle the guides in the live specimen. [Grid specimen](https://alpina-ui.vercel.app/docs/components/grid/) · [Josef Müller-Brockmann, *Grid systems in graphic design*, Niggli](https://niggli.ch/en/products/rastersysteme-fur-die-visuelle-gestaltung)

Use equal-height rows when labels, titles and values need to line up across adjacent cards. With `asChild`, the card itself occupies the grid field. Its children participate in the parent's row tracks, so a translated title can wrap while both time labels remain aligned. `subgrid` accepts `rows`, `columns` or `both`. [CSS Grid Layout Level 2](https://www.w3.org/TR/css-grid-2/)

```tsx
<Grid fields="five-seven" rows={3}>
  {sessions.map(({ field, label, title, time }) => (
    <GridItem key={field} field={field} subgrid="rows" asChild>
      <Card as="article">
        <Typography variant="label">{label}</Typography>
        <Typography as="h3" variant="heading">{title}</Typography>
        <Typography numeric>{time}</Typography>
      </Card>
    </GridItem>
  ))}
</Grid>
```

Supply one `lead` and one `detail` field to either preset. For a different layout, write a matrix with one string per row. Repeated names form rectangles, and a full stop leaves a cell empty. A matrix determines the number of columns and rows. For unnamed tracks, `row` and `rowSpan` place a `GridItem` by one-based row number.

```tsx
<Grid fields={['date title title', 'date venue .']}>
  <GridItem field="date">12.03</GridItem>
  <GridItem field="title">Press day</GridItem>
  <GridItem field="venue">Basel</GridItem>
</Grid>
```

## Set a page on the grid

Use `data-al-theme="auto"` on a page or container to follow the device's color scheme. Explicit `light` and `dark` values also work inside an automatic theme. A switch changes its track over `--al-duration-fast` (120 ms) using `--al-ease`. The standard duration is 180 ms. Reduced motion sets both durations to zero and stops the loading dial. The skeleton reserves its space with a static tint.

The theme builder previews a single component surface with your accent, a spacing unit and light or dark paper. It reports the text contrast for the button label and for accent text on the background. The exported CSS preserves system colors in forced-colors mode. Import it after the library stylesheet and apply the corresponding `data-al-theme` attribute to the container. [Theme builder](https://alpina-ui.vercel.app/themes/) · [WCAG minimum text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Align the introduction, component previews and navigation to the same page margins. Give a working example enough columns for its longest translated label. At narrow widths, let each preview take a full row and keep the heading before its controls in the reading order. [Homepage](https://alpina-ui.vercel.app/) · [Homepage source](https://github.com/stedbrown/alpina-ui/blob/main/web/pages.tsx)

Use `space="cover"` to give an opening section responsive vertical padding. Set `surface="accent"` for a red band or `ruler` to show the active columns. The `poster` type role scales with the container width. The site sets `data-al-page` on the body to apply the library’s page defaults.

## Proof the baseline

At the default browser text size the grid unit is 4 CSS pixels. A caption advances by four units, a label by five and body copy by six. The same module sets control heights, vertical padding and the space reserved for structural dividers. Thin dividing strokes can be painted within a complete module, so adding a row does not add a stray pixel to everything below it. Responsive heading leading and section padding round to the nearest whole module as the available width changes.

Press **Ctrl+Shift+G** on any portal page or in the offline catalog to toggle the proofing overlay. The stronger edge bands are the page margins. The vertical fields follow the grid’s 4, 8 and 12 columns, and the horizontal lines mark the baseline interval. The overlay accepts no pointer or keyboard input and disappears for print. Mount `<GridOverlay placement="container" width="full" />` inside a positioned container to inspect a smaller composition. [Overlay specimen](https://alpina-ui.vercel.app/docs/components/grid-overlay/)

Text baselines advance by whole modules within each text run. The first ink position depends on the typeface's ascent. Artwork with an explicit aspect ratio retains that ratio, and the SIX payment slip retains its dimensions in millimetres. These intrinsic dimensions can fall between screen grid lines.

## Rows of controls

Use `Grid` to allocate areas of the page and `Stack` to arrange elements inside an area. With `direction="row"`, children wrap when space runs out, including when an Italian label becomes a longer German one. `gap={2}` is two modules, or 8 px at a 16 px root. `justify="space-between"` places two groups at opposite ends of the available space. In a column, children stretch across the width and the default gap is 4.

```tsx
<Stack direction="row" gap={2} justify="space-between">
  <Typography as="h2" variant="heading">Contacts</Typography>
  <Button onClick={openForm}>New contact</Button>
</Stack>
```

## Proof a layout at a fixed width

Use `<Typography variant="specimen" specimenSize={144} tracking={-0.05}>Aa Rg</Typography>` when comparing letterforms. The size is measured in CSS pixels and numeric tracking in em. Optical sizing follows the live type size. [Type specimen](https://alpina-ui.vercel.app/#type)

Place a Grid inside `GridSpecimen` to inspect the same content at its available width or at a width in CSS pixels. A fixed proof scrolls inside its labelled region. Set `zoom={4}` to magnify the same content to 400% and test its layout at one quarter of the available width. Set `palette="system"` to preview system colors locally. The focus indicator and written state remain available in both palettes. `observeGridSpecimen(viewport, textSample, onMeasure)` reports the rendered width, column count, margin, gutter, grid unit, font size, line height and horizontal overflow after a resize. Call its returned cleanup function when the specimen unmounts.

Use `Typography variant="display" responsive` for display text that follows the enclosing Alpina grid. Its size and line height are 40/40 px up to 19 rem, 48/48 px up to the 54 rem breakpoint and 64/64 px above it at the default grid unit. A `DescriptionList layout="columns"` can present those measurements as a compact row that wraps in reading order.

## Reading the original work

### Where the red goes

In Josef Müller-Brockmann's *der Film* (1960), the title crosses a black field. Small red text giving the venue and opening hours aligns with the F in Film. A viewer can recognize the subject from across a room and find the details up close. The same axis links the two readings. The Smithsonian catalog also identifies the gray of “der” and the white of “Film.” [Cooper Hewitt, Smithsonian Design Museum, *der Film*](https://www.si.edu/object/der-film-film%3Achndm_1999-46-2)

Alpina uses white, black, and red as its three solid colors. The white field continues from the portal title to the example. Red marks the date in the program, the current index entry, and primary actions. In an alert, the word identifying the state must carry the meaning on its own. A border or sign can reinforce it. Frequent use weakens the accent. The three-color constraint belongs to Alpina's art direction. Historical poster designers made their own decisions about inks.

#### Choosing a red

Light paper uses `#EB0000` with white button labels (4.63:1). Dark paper uses `#FF5252` with black button labels (6.58:1). The same ratios apply to accent text on the corresponding page background. Fine rules use mixtures of black and white. Essential controls have stronger boundaries. The selected index entry combines color with a vertical rule and bold type. Forced-colors mode follows the reader's system palette. [W3C, minimum contrast and relative luminance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

### A grid for a series

Müller-Brockmann's *Musica Viva* posters form a family of compositions. In the 1958 example, four circular shapes relate to a three-column structure. The program establishes an axis for practical information, while the figure conveys the character of the evening. Looking at successive editions shows how much variation one structure can sustain. [Poster House, *The Swiss Grid*](https://access.posterhouse.org/exhibition/swiss-grid-2/)

Karl Gerstner explored this question in the four essays of *Designing Programmes* (1964). Designing a program means deciding which relationships must hold and which parameters can vary. A digital application makes the result observable. In Alpina's specimen, the same schedule appears in 320, 640, and 960 px containers. The time, title, and format stay identifiable. Turn on the grid to inspect the axes. Change the width to see what the browser actually computes. [Lars Müller Publishers, *Designing Programmes* facsimile](https://www.lars-mueller-publishers.com/designing-programmes-0)

### Basel and optical alignment

In *Giselle* (1959), Armin Hofmann sets a moving photographic figure against the crisp outlines of letters. A quieter detail is the optical alignment of the numeral 1. Its vertical stroke matters to the eye as much as the geometric edge of the glyph. For the 1960–61 Stadttheater Basel season, a recurring large letter leaves a clear area for the changing weekly program. Audiences could recognize the season as the content changed. [MoMA, *Giselle*](https://www.moma.org/collection/works/6775/) · [Poster House, exhibition commentary](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Poster House, *Stadttheater Basel*](https://collection.posterhouse.org/poster/stadttheater-basel-saison-60-61/)

Timetable digits must be comparable row by row. Alpina uses tabular figures for them. A display heading can use tighter spacing, while a text input needs to remain easy to read at body size. In the portal, the API name, display title, and description recur in consistent positions. The largest area belongs to the component. A calendar and a keyboard hint can therefore use different widths on the same page.

### From the page to wayfinding

The 1978–80 Swiss Federal Railways (SBB) manual documents the construction of the symbol, pictograms, platform numbers, and sign dimensions. Hans Hartmann designed the mark in 1972. Müller-Brockmann and his collaborators later addressed the relationships among symbols, text, and sign surfaces. In an interface, a position can likewise retain its meaning across views. The selected entry, view title, and content form a route that can also be followed with a keyboard. [Museum für Gestaltung Zürich, SBB manual](https://old.eguide.ch/en/objekt/sbb/)

Today's SBB digital design system publishes column counts, margins, and gutters for different available widths. Its visual design guidance also addresses zoom and interactive targets. This is a precedent for documenting the measurements of a product. In Alpina, breakpoints refer to a component's container so a grid inside a panel responds to the width of that panel. [SBB Lyne layout](https://digital.sbb.ch/en/design-system/lyne/design-tokens/layout/) · [SBB accessible visual design](https://digital.sbb.ch/en/accessibility/roles/visual-design/)

## A typographic cover in React

```tsx
import { Grid, GridItem, Typography } from 'alpina-ui'

export function ProgrammeCover() {
  return (
    <Grid as="section" surface="accent" space="cover" entrance="sequence" aria-labelledby="programme-title">
      <GridItem medium={5} large={8}>
        <Typography id="programme-title" as="h1" variant="masthead" tracking="optical">
          Spring programme
        </Typography>
      </GridItem>
      <GridItem medium={3} large={3} start={{ large: 10 }}>
        <Typography>Print workshops and open studios.</Typography>
      </GridItem>
    </Grid>
  )
}
```

A full-height cover uses `<Grid space="viewport" guides id="cover">`. The text, figures and controls share its column tracks. The grid has a minimum height of 100svh and grows for large text. Connect an optional switch to `cover-guides` to hide the lines. With `<Typography variant="masthead" responsive>`, the longer of two poster lines can occupy the grid width. Both lines use tight tracking (−0.035 em) and a 0.86 em baseline interval. A numbered chapter uses a full-width Grid with space="chapter". Its section heading shares the left edge with the folio, and the working specimen starts on the sixth large column. Paper and ink reverse with the reader’s theme.

The masthead scales with its grid container from 44 to 148 CSS pixels at the default root size. Its 0.94 em line height rounds to the baseline unit. Optical tracking follows the display scale. Choose `tracking="normal"` to compare the font's original spacing. The optional entrance moves grid items eight pixels into place once, with the last group starting after 105 ms. Assign `entranceStep` 1, 2 or 3 to stage related items together. On the cover the title starts at 0 ms, guides at 80 ms and figures at 160 ms. The text is visible from its first paint. Readers who prefer reduced motion see the finished layout immediately. [Typography reference](https://alpina-ui.vercel.app/docs/components/typography/) · [Grid reference](https://alpina-ui.vercel.app/docs/components/grid/)
