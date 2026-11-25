# Designing with three inks

## What makes an interface Swiss?

The Swiss Federal Department of Foreign Affairs traces Swiss graphic design to the meeting of the design school, the print workshop, and commissioned work. Basel and Zurich taught applied graphic design as early as 1915. By the 1950s and 1960s, their work was recognizable internationally. For a digital library, the useful comparison is a series. A single catalog spread can look striking. A grid that remains legible as the title, language, and quantity of information change gives designers a repeatable method. [About Switzerland, history of Swiss Style](https://www.aboutswitzerland.eda.admin.ch/it/swiss-style-forever-storia-della-nascita-di-una-tradizione-nel-campo-della-grafica)

## Where the red goes

In Josef Müller-Brockmann's *der Film* (1960), the title crosses a black field. Small red text giving the venue and opening hours aligns with the F in Film. A viewer can recognize the subject from across a room and find the details up close. The same axis links the two readings. The Smithsonian catalog also identifies the gray of “der” and the white of “Film.” [Cooper Hewitt, Smithsonian Design Museum, *der Film*](https://www.si.edu/object/der-film-film%3Achndm_1999-46-2)

Alpina uses white, black, and red as its three solid colors. The white field continues from the portal title to the example. Red marks the date in the program, the current index entry, and primary actions. In an alert, the word identifying the state must carry the meaning on its own. A border or sign can reinforce it. Frequent use weakens the accent. The three-color constraint belongs to Alpina's art direction. Historical poster designers made their own decisions about inks.

### Choosing a red

Alpina uses `#EB0000`. Against pure white, the contrast ratio is approximately 4.63 to 1. Against pure black, it is about 4.53 to 1. The accent remains legible in both themes. Fine rules between surfaces use mixtures of black and white. Essential control outlines have stronger contrast. The selected index entry combines color with a vertical rule and bold type. Forced-colors mode lets readers use their system palette. The ratios above apply to the stated solid color pairs. [W3C, minimum contrast and relative luminance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## A grid for a series

Müller-Brockmann's *Musica Viva* posters form a family of compositions. In the 1958 example, four circular shapes relate to a three-column structure. The program establishes an axis for practical information, while the figure conveys the character of the evening. Looking at successive editions shows how much variation one structure can sustain. [Poster House, *The Swiss Grid*](https://access.posterhouse.org/exhibition/swiss-grid-2/)

Karl Gerstner explored this question in the four essays of *Designing Programmes* (1964). Designing a program means deciding which relationships must hold and which parameters can vary. A digital application makes the result observable. In Alpina's specimen, the same schedule appears in 320, 640, and 960 px containers. The time, title, and format stay identifiable. Turn on the grid to inspect the axes. Change the width to see what the browser actually computes. [Lars Müller Publishers, *Designing Programmes* facsimile](https://www.lars-mueller-publishers.com/designing-programmes-0)

## Basel and optical alignment

In *Giselle* (1959), Armin Hofmann sets a moving photographic figure against the crisp outlines of letters. A quieter detail is the optical alignment of the numeral 1. Its vertical stroke matters to the eye as much as the geometric edge of the glyph. For the 1960–61 Stadttheater Basel season, a recurring large letter leaves a clear area for the changing weekly program. Audiences could recognize the season as the content changed. [MoMA, *Giselle*](https://www.moma.org/collection/works/6775/) · [Poster House, exhibition commentary](https://access.posterhouse.org/exhibition/swiss-grid-2/) · [Poster House, *Stadttheater Basel*](https://collection.posterhouse.org/poster/stadttheater-basel-saison-60-61/)

Timetable digits must be comparable row by row. Alpina uses tabular figures for them. A display heading can use tighter spacing, while a text input needs to remain easy to read at body size. In the portal, the API name, display title, and description recur in consistent positions. The largest area belongs to the component. A calendar and a keyboard hint can therefore use different widths on the same page.

## From the page to wayfinding

The 1978–80 Swiss Federal Railways (SBB) manual documents the construction of the symbol, pictograms, platform numbers, and sign dimensions. Hans Hartmann designed the mark in 1972. Müller-Brockmann and his collaborators later addressed the relationships among symbols, text, and sign surfaces. In an interface, a position can likewise retain its meaning across views. The selected entry, view title, and content form a route that can also be followed with a keyboard. [Museum für Gestaltung Zürich, SBB manual](https://old.eguide.ch/en/objekt/sbb/)

Today's SBB digital design system publishes column counts, margins, and gutters for different available widths. Its visual design guidance also addresses zoom and interactive targets. This is a precedent for documenting the measurements of a product. In Alpina, breakpoints refer to a component's container so a grid inside a panel responds to the width of that panel. [SBB Lyne layout](https://digital.sbb.ch/en/design-system/lyne/design-tokens/layout/) · [SBB accessible visual design](https://digital.sbb.ch/en/accessibility/roles/visual-design/)

## Alpina's measurements

| Container | Columns | Inner margin | Gutter |
| --- | ---: | ---: | ---: |
| Below 36 rem | 4 | 16 px | 12 px |
| From 36 rem | 8 | 24 px | 16 px |
| From 54 rem | 12 | 32 px | 24 px |

Pixel equivalents assume a 16 px root. Alpina's module is 0.25 rem. Each role pairs type size with line height. Annotations use 12/16, labels 14/20, body text 16/24, headings 24/28, and display type 48/48 or 64/64. Line height sets the vertical rhythm even when type size falls between modules, as it does at 14 px. Alpina chose these measurements for digital interfaces. Text scales with reader preferences, the grid positions blocks, and a long sentence can wrap across several lines.

## Reading the portal

The public source, preview and installation paths follow a practice demonstrated by shadcn/ui. For interaction design, Radix documents how focus moves into and out of a popup, and React Aria shows accessible primitives working together on actual records. Alpina applies those patterns to a workshop reservation and an invoice decision. The typography, four-pixel spacing unit and responsive columns come from Alpina's own design system. [shadcn/ui documentation](https://ui.shadcn.com/docs) · [Radix accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility) · [React Aria examples](https://react-aria.adobe.com/)

1. In the specimen, switch from 320 to 960 px and show the grid. Follow the first digit of each time and the first letter of each title.
2. In the index, open a short entry and then a much longer one. Look for the red marker and the positions of Preview, Code, and Source.
3. In the contact directory example, switch languages, filter contacts, and sort amounts. Compare the margins where text wraps.
4. In the chart, compare quantities by reading their labels. In a form, make a selection and trigger an error. Identify both states using the text and marks alone.

The distribution includes the components used for the portal's index, controls, code block, and navigation. The catalog lets you compare each example with the installable source and reproduce the behavior you tried.
