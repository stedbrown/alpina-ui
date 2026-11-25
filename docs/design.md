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

Both WOFF2 files are served by the application. CSS bundlers resolve their relative URLs automatically. If you copy the CSS manually, place `fonts/inter-latin-wght-normal.woff2` and `fonts/inter-latin-ext-wght-normal.woff2` next to it in a `fonts/` directory. The Latin file covers accents used in Italian, German, French and Romansh, including **città**, **Grüezi**, **œuvre** and **bainvgnü**. The extended subset loads for additional letters such as **ẞ**. The package redistributes the unmodified normal-style subsets from `@fontsource-variable/inter@5.3.0` and their SIL Open Font License 1.1. Keep the accompanying license when redistributing the files. [Fontsource Inter](https://fontsource.org/fonts/inter) · [Bundled license](../src/fonts/OFL.txt)

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

## Set a page on the grid

The theme builder previews a single component surface with your accent, a spacing unit and light or dark paper. It reports the text contrast for the button label and for accent text on the background. The exported CSS preserves system colors in forced-colors mode. Import it after the library stylesheet and apply the corresponding `data-al-theme` attribute to the container. [Theme builder](https://alpina-ui.vercel.app/themes/) · [WCAG minimum text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

Align the introduction, component previews and navigation to the same page margins. Give a working example enough columns for its longest translated label. At narrow widths, let each preview take a full row and keep the heading before its controls in the reading order. [Homepage](https://alpina-ui.vercel.app/) · [Homepage source](https://github.com/stedbrown/alpina-ui/blob/main/web/pages.tsx)

## Rows of controls

Use `space="cover"` to give an opening section responsive vertical padding. Set `surface="accent"` for a red band or `ruler` to show the active columns. The `poster` type role scales with the container width. The site sets `data-al-page` on the body to apply the library’s page defaults.

## Proof the baseline

At the default browser text size the grid unit is 4 CSS pixels. A caption advances by four units, a label by five and body copy by six. The same module sets control heights, vertical padding and the space reserved for structural dividers. Thin dividing strokes can be painted within a complete module, so adding a row does not add a stray pixel to everything below it. Responsive heading leading and section padding round to the nearest whole module as the available width changes.

Press **Ctrl+Shift+G** on any portal page or in the offline catalog to toggle the proofing overlay. The stronger edge bands are the page margins. The vertical fields follow the grid’s 4, 8 and 12 columns, and the horizontal lines mark the baseline interval. The overlay accepts no pointer or keyboard input and disappears for print. Mount `<GridOverlay placement="container" width="full" />` inside a positioned container to inspect a smaller composition. [Overlay specimen](https://alpina-ui.vercel.app/docs/components/grid-overlay/)

Text baselines advance by whole modules within each text run. The first ink position depends on the typeface's ascent. Artwork with an explicit aspect ratio retains that ratio, and the SIX payment slip retains its dimensions in millimetres. These intrinsic dimensions can fall between screen grid lines.

Use `Grid` to allocate areas of the page and `Stack` to arrange elements inside an area. With `direction="row"`, children wrap when space runs out, including when an Italian label becomes a longer German one. `gap={2}` is two modules, or 8 px at a 16 px root. `justify="space-between"` places two groups at opposite ends of the available space. In a column, children stretch across the width and the default gap is 4.

```tsx
<Stack direction="row" gap={2} justify="space-between">
  <Typography as="h2" variant="heading">Contacts</Typography>
  <Button onClick={openForm}>New contact</Button>
</Stack>
```
