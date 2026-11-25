# Independent assistant trial

A new coding agent received the installed Alpina skill, the extracted release candidate and four customer briefs. Each submission is an independent React application component. The agent could consult the package's own declarations, registry and guides. It had no access to the library worktree, the assessment criteria or the other contributors' work.

## Customer briefs

1. Create a French-language invoice for a small Neuchâtel studio. Bill 2.5 hours of work plus a printed item, include VAT and a Swiss QR payment slip, and let me print it. Use fictional customer details.
2. Build an Italian-language municipal intake form for an AVS number and a Swiss mailing address. I want to enter an address, get useful validation and submit the form.
3. Build a German-language accounting ledger with dated CHF bookings including a refund. Show a closing balance and let the bookkeeper sort the entries.
4. Design a bilingual Swiss editorial landing page announcing an architecture exhibition. I need a headline, introduction, opening date, venue and a programme that reads well on a phone and a wide desktop.

## Assessment criteria

- Each independent application sets its locale with `AlpinaProvider` and loads the packaged stylesheet.
- Each submission passes strict TypeScript against the extracted archive and renders in a browser without console errors or uncaught exceptions. Type assertions that suppress invalid component props do not qualify.
- The author composes public controls and layout components. No Tailwind utilities, custom color overrides or gradients. Paper, ink and the single red accent come from the library.
- Check 360 px and desktop widths for overflow. Evaluate the shared column edges and responsive arrangement in the editorial example. Document components and the ledger use their own established grids.
- Exercise the customer task. Check the printed invoice and its payment section, a failed and a valid intake submission, sorting and the closing balance, and the bilingual exhibition programme.

## Results

| Submission | Observed result |
| --- | --- |
| [French invoice](Invoice.tsx) | The dated invoice renders its payment slip and CHF 294.03 total. Its print button scopes the browser print request to that invoice. The author also checked the SCOR and payload against the installed validators. |
| [Italian intake form](Residence.tsx) | Empty submission marks the AVS field invalid. A valid AVS and Lugano address produce a focused receipt. This sample processes the form in memory and says so on screen. |
| [German ledger](Ledger.tsx) | The refund sorts first in ascending amount order. The closing balance is CHF 2,080.65. The first run exposed 14 px of page overflow at 360 px. Positioning the visually hidden currency labels within the table’s scroll region fixed it in the library. |
| [Bilingual exhibition](Editorial.tsx) | The German and French introductions share a row on the 12-column grid at 1280 px and stack on the 4-column grid at 360 px. The programme contains three timed entries in both languages. |

All four original submissions compile against the packaged declarations and render at both widths without console errors. They import the stylesheet, set a provider locale, and use the library palette. The author used small inline spacing rules for the invoice frame, confirmation area and programme list. The regression uses the original submissions unchanged, including the ledger that exposed the overflow.

Run `node tests/skill-examples.browser.mjs` after installing the repository development dependencies and Chromium. Pass `--archive=path/to/alpina-ui.tgz` to exercise a fresh local package that contains the current skill.
