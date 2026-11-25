# Visual regression tests

Every component in the registry has a live React example. Playwright renders each example at 320, 768, 1024 and 1440 CSS pixels in both light and dark themes. At 768 px the same examples also run with forced colors and increased contrast, each with light and dark system colors. Overlays appear open so the reference captures the actual menu, tooltip, notification or dialog at its viewport position. Taller inline components are captured to their full height. The PNG references live under `tests/visual-reference/<platform>/<component>/`. They stay in the repository and are excluded from the npm package.

## Compare a build

Use Node.js 24 and run the following commands from the repository root.

```sh
npm ci
npm run build
npx --no-install playwright-core install --with-deps chromium
npm run test:visual
```

On Windows, use `npx --no-install playwright-core install chromium`. On macOS the test uses Docker and the official Playwright image matching the locked package version. Start Docker Desktop and omit the native browser installation. You can select the same Linux environment explicitly with `npm run test:visual -- --linux-container`.

The full `npm run test:browser` command includes these comparisons. Run `npm run test:visual -- --component=button` to inspect a single component. A missing reference, a changed image size or a pixel difference above tolerance fails the suite. The failure identifies the component, width and theme. Actual renders and difference images are written to `test-results/visual/`.

## Review an intentional change

1. Build the changed sources, run the comparison, and inspect the expected PNG beside the actual render. In a difference image, red pixels mark changes.
2. Run `npm run test:visual:update -- --component=button` for the affected component. Omit the filter to regenerate the full registry.
3. Update the Windows references on Windows. Update the Linux references using the Linux runner or `npm run test:visual:update -- --linux-container`.
4. Review the changed images and rerun the comparison before committing them with the component change.

The captures use the bundled Inter typeface, the pinned Chromium headless shell, CSS-pixel density, a fixed clock, Zurich time and reduced motion. Linux uses the DejaVu families for system fallback. Windows and Linux have separate references because their text renderers produce different glyph pixels and can wrap text differently at the same width.

The comparison uses Pixelmatch with a per-pixel color threshold of 0.14 and ignores anti-aliased edge pixels. The differing pixel allowance is 0.1% of the canvas, bounded between 5 and 128 pixels. Ink, paper, spacing and line wrapping participate in the comparison.

## Portal pages

The screenshot harness waits for the bundled Inter faces before measuring the designed layout. Lighthouse exercises the production preload and optional-display policy on a cold cache. The site suite also captures the first viewport of every public route at 800 px. The homepage is captured in full, in both appearances at 320, 360, 640, 768, 800, 960, 1024 and 1440 px. After building the catalog, compare with `node tests/site-visual.browser.mjs` or record an intentional revision with `--update`. References are kept separately for Windows and Linux under `tests/site-reference/`. The responsive sweep also measures rendered number and identifier lines independently of the pixel comparisons.

## Reader preferences

The high-contrast captures use the browser's actual media emulation. Inspect a specific combination with `npm run test:visual -- --component=combobox --appearance=forced-colors-dark`. Other names are `forced-colors`, `contrast-more`, and `contrast-more-dark`. Focus, highlighted choices and the payment code are checked separately in the browser.

The text audit enlarges the root font to 200% and applies user styles with 1.5 line height, .12em letter spacing, .16em word spacing and 2em after paragraphs. It measures text geometry throughout the gallery at 320, 640 and 1280 CSS pixels and checks representative portal pages at 800 px. Data tables, long identifiers and calendar grids retain local scrolling where two-dimensional content requires it. The payment slip includes a reflowable reading view in the chosen correspondence language. Its fixed-size print layout remains available through the browser's print dialog. [WCAG text resizing](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) · [WCAG text spacing](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)
