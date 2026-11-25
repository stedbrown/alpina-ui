# Visual regression tests

Every component in the registry has a live React example. Playwright renders each example at 320, 768, 1024 and 1440 CSS pixels in both light and dark themes. Overlays appear open so the reference captures the actual menu, tooltip, notification or dialog at its viewport position. Taller inline components are captured to their full height. The PNG references live under `tests/visual-reference/<platform>/<component>/`. They stay in the repository and are excluded from the npm package.

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
