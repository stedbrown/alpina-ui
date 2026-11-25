// Render every raster size from the same vector used by the portal and GitHub.
import { readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const dir = new URL('../web/assets/', import.meta.url)
const asset = name => new URL(name, dir)
const logo = await readFile(asset('logo.svg'), 'utf8')
const mountain = logo.match(/fill-rule="evenodd" d="([^"]+)"/)[1]
await writeFile(asset('logo-mono.svg'), logo.replace(/  <path fill="#eb0000"[^\n]*\n/, '').replace('fill="#fff"', 'fill="currentColor"').replace(mountain, 'M0 0h64v64H0z ' + mountain))
await writeFile(asset('favicon.svg'), logo)

const browser = await chromium.launch({ ...(process.env.CHROME_PATH && { executablePath: process.env.CHROME_PATH }) })
try {
  const page = await browser.newPage()
  await page.setContent('<style>*{margin:0}svg{display:block;width:100vw;height:100vh}</style>' + logo)
  for (const [size, filename] of [[32, 'favicon.ico'], [64, 'alpina-mark.png'], [180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png']]) {
    await page.setViewportSize({ width: size, height: size })
    const png = await page.screenshot()
    if (filename.endsWith('.ico')) {
      const header = Buffer.alloc(22)
      header.writeUInt16LE(1, 2) // ICO type
      header.writeUInt16LE(1, 4) // one directory entry
      header[6] = header[7] = size
      header.writeUInt16LE(1, 10) // planes
      header.writeUInt16LE(32, 12) // bit depth
      header.writeUInt32LE(png.length, 14)
      header.writeUInt32LE(header.length, 18)
      await writeFile(asset(filename), Buffer.concat([header, png]))
    } else await writeFile(asset(filename), png)
  }

  // The social card is captured from the real homepage by readme-screenshots.mjs.
} finally { await browser.close() }
