# Building an address book using only the portal

## How the trial worked

I started with an empty React and TypeScript project, opened the Alpina 0.4 HTML catalog in Chrome while offline, and downloaded the package from its installation guide. I used the published pages to learn Alpina and the local toolchain to compile and test the example. I wrote the address book from scratch, without copying the portal’s customer directory demo.

The quick start, grid, foundational component, and Swiss formatting guides covered the layout. I used the API and example views for Grid, Item, ToggleGroup, Field, Input, Select, DropdownMenu, Sheet, AlertDialog, Typography, and Empty. The SwissAddressForm reference documented initial values and saving. The formatting guide explained how language changes preserve an address draft.

## Baseline with Alpina 0.4

The application stylesheet contained 20 rule blocks, 56 declarations, and 101 lines in the example’s formatting. The measurement covers only `src/rubrica.css`. The application used public APIs throughout, with no inline styles or selectors targeting internal library classes.

| Part of the address book | CSS involved | Why it was needed |
| --- | --- | --- |
| Control bars | Shared rule for `mast-line`, `opening`, and `section-line` | Four bars pair different kinds of elements. Five shared declarations provide baseline alignment, spacing, and wrapping. |
| Edit panel | `editor-body` | Places the language switch and the form in a vertical stack with a gap. |
| Search, canton, and sort controls | `search-tools` | An intrinsic grid adjusts the number of columns to the available space. |
| Current row | `index-list li` and its `data-current` state | A red rule identifies the open record while keeping the text aligned across rows. The link identifies the current record to assistive technology. |
| Heading and address detail | `directory-title`, `record-folio`, `record-body`, `record address`, and `record-canton` | The heading, record number, and postal address have different roles in this application. Each record keeps its number when the list is sorted. |
| Long German heading | `directory-title` | On a 320 px viewport, the German heading made the page 357 px wide. Hyphenation and wrapping brought the page back to 320 px. |

The library already supplied the column grid, form controls, validation states, edit panel, confirmation dialog, and keyboard handling for the menu. Each `Item` received the record number in `leading`, the name and location in its content, and the action menu in `trailing`.

## Decisions the application had to make

The canton filter lists only cantons represented in the dataset and includes an “All” option users can select to clear it. The 0.4 CantonSelect placeholder is disabled. I used Select with the public canton dataset documented in the portal. Localized display names preserve the original postal address.

The 0.4 menu gave Edit and Delete the same visual treatment. The application opened an AlertDialog naming the selected contact before deletion. To restore focus after cancellation, the first implementation located the menu button by its ARIA attribute inside the record.

## Repeating the trial with Alpina 0.5

I downloaded the new package from the portal, read the Stack, Item, Typography, and DropdownMenu references, and followed the bilingual address book guide. The data, workflows, and editorial design stayed the same. The application stylesheet now had **16 rule blocks, 43 declarations, and 78 lines**. That removed **13 of the original 56 declarations, or 23.2%**.

| Change | Application CSS removed |
| --- | ---: |
| Four control bars use horizontal Stack with baseline alignment, wrapping, and separate gaps. The edit panel uses a vertical Stack for its language switch and form. | 8 declarations |
| `Item current` marks the open record and keeps the other rows aligned. The link still exposes `aria-current`. | 3 declarations |
| Typography handles wrapping and hyphenation for “Atelierverzeichnis”. The document still fits at 320 px after removing the two local rules. | 2 declarations |

The compact menu aligns to the end of the trigger. A separator and destructive styling distinguish Delete from Edit. AlertDialog handles confirmation, and `triggerRef` restores focus to the correct button. The address book still uses Select to filter to cantons present in its data. For a filter that includes all 26 cantons, CantonSelect also offers `allLabel`.

### Where custom CSS remains

Four declarations lay out the three filters, including their vertical spacing. Three remove default list markers and indentation while preserving list semantics. The other 36 set the page width, margins, rules, title and detail hierarchy, record number, and postal address treatment. The library styles cover text inputs, validation states, the menu, and the confirmation dialog.

The repository includes the original stylesheet and the selector-level counts for each version. Five Stack instances express layout choices through public JSX properties. The metric measures the application stylesheet and excludes the library’s CSS and the size of the compiled page. [Baseline CSS](evidence/baseline-0.4.css) · [0.4 measurements](evidence/baseline-0.4.json) · [0.5 measurements](evidence/finale-0.5.json)

## Reproduce the checks

Run `npm test` in the example directory after building. It covers accent-insensitive search, filtering, sorting, selection, validation, creation, editing, cancellation, and deletion. It also checks the page language, draft preservation, keyboard focus, and that contact details stay out of localStorage. The standalone HTML was opened offline. Run `node scripts/css-count.mjs` for a count by selector.

Both languages were checked at widths of 320, 390, 768, and 1440 px. In 0.4, automated accessibility checks covered the list, open menu, edit panel, and confirmation dialog in both languages at 320 and 1440 px. No violations were reported across those 16 states. The functional tests passed in 0.5, and the same 16 accessibility checks again reported no violations. At a viewport width of 320 px, the tested menu measured 192 px wide with its left edge at 96 px, keeping both actions in view.
