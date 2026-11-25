// Render every raster size from the same vector used by the portal and GitHub.
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
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

  const font = await readFile(new URL('../src/fonts/inter-latin-standard-normal.woff2', import.meta.url))
  await page.setViewportSize({ width: 1200, height: 630 })
  await page.setContent(`<style>
    @font-face{font-family:Inter;src:url(data:font/woff2;base64,${font.toString('base64')}) format("woff2");font-weight:100 900}
    *{box-sizing:border-box}body{margin:0;padding:52px 60px;color:#121212;background:#fff;font:550 32px Inter,sans-serif}
    header{display:flex;align-items:center;gap:15px}header svg{width:56px;height:56px}
    main{margin-top:51px;font:720 142px/.89 Inter,sans-serif;letter-spacing:-8px;font-optical-sizing:auto}
    main span{display:block;color:#eb0000}footer{margin-top:50px;border-top:2px solid;padding-top:17px;display:flex;justify-content:space-between;font-size:26px;letter-spacing:-.6px}
    </style><header>${logo} Alpina UI</header><main>Swiss UI<span>for React.</span></main><footer><span>Forms, tables and printed documents</span><span>Open source · MIT</span></footer>`)
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: fileURLToPath(asset('alpina-preview.png')) })
} finally { await browser.close() }
