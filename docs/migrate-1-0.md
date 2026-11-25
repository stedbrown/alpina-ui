# Move from Alpina 0.x to 1.0

The release candidates preserve the component imports, named props and CLI registry names in the archived 0.5–0.14 releases. There are no Alpina exports marked deprecated in the candidate. Keep existing component names, including `Attachment` for a download link and `FileInput` for picking a file. The two components serve different tasks. No JavaScript or TypeScript codemod is needed.

## Install and verify

Commit your lockfile first. Install the exact archive in your React project, then run your application’s typecheck and tests. For source-copy projects, run `npx --no-install alpina diff` to compare the new sources with local edits. To roll back, restore your previous manifest, lockfile and any edited component sources, then run `npm ci`.

```sh
npm install https://alpina-ui.vercel.app/alpina-ui-1.0.0-rc.3.tgz
```

## Calendar week numbers

Calendar and DatePicker omit week numbers by default from RC2. If your existing layout depends on that column, pass `showWeekNumbers` to either component.

## Self-hosted font filenames

Since 0.14, Inter includes the optical-size axis. If your bundler imports `alpina-ui/fonts.css`, it already resolves both assets. If you copied fonts into a public folder or wrote preload links manually, update both filenames and the stylesheet together.

| Through 0.13 | From 0.14 onwards |
| --- | --- |
| `inter-latin-wght-normal.woff2` | `inter-latin-standard-normal.woff2` |
| `inter-latin-ext-wght-normal.woff2` | `inter-latin-ext-standard-normal.woff2` |

Save the example as `copy-alpina-fonts.mjs` in your project and run `node copy-alpina-fonts.mjs public/alpina`. Link to `/alpina/fonts.css`. A manual Latin preload should point to `/alpina/fonts/inter-latin-standard-normal.woff2`.

```js
import { copyFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const target = process.argv[2] ?? 'public/alpina'
const sheet = new URL(import.meta.resolve('alpina-ui/fonts.css'))
await mkdir(join(target, 'fonts'), { recursive: true })
await copyFile(sheet, join(target, 'fonts.css'))
for (const name of ['inter-latin-standard-normal.woff2', 'inter-latin-ext-standard-normal.woff2', 'OFL.txt']) {
  await copyFile(new URL('./fonts/' + name, sheet), join(target, 'fonts', name))
}
```

## Check display assertions

Short civil dates default to day.month.year. Set a date style explicitly for prose. Negative CHF amounts use a nonbreaking space and a typographic minus. Store the underlying amount or civil date independently from its display string. Save this example as `check-formats.mjs` and run `node check-formats.mjs`.

```js
import assert from 'node:assert/strict'
import { formatCHF, formatSwissDate } from 'alpina-ui'

assert.equal(formatCHF(-1.05, 'de-CH'), 'CHF\u00a0\u22121.05')
assert.equal(formatSwissDate('2026-11-25', 'de-CH'), '25.11.2026')
```

The field validators now explain checksum failures separately from malformed input. If an application maps validation failures to its own UI, use validation results and field paths instead of comparing translated sentences. Review the individual 0.x changes for print, accounting and cash rounding. [Upgrade notes](https://alpina-ui.vercel.app/docs/guides/release/) · [API stability policy](https://alpina-ui.vercel.app/docs/guides/api-stability/)
