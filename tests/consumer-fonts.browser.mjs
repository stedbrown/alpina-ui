import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import { mountComponentGallery, galleryOverlays } from './component-gallery.mjs'
import { launchVisualBrowser } from './visual-tools.mjs'

const root = new URL('../', import.meta.url)
const { items } = JSON.parse(await readFile(new URL('registry.json', root)))
const blocks = (await readdir(new URL('blocks/', root))).filter(file => file.endsWith('.tsx')).map(file => file.slice(0, -4)).sort()
const bundle = await build({
  stdin: {
    contents: `
      import { createRoot } from 'react-dom/client'
      import { Alert, SwissAddressFields } from 'alpina-ui'
      import { blockDemos } from './web/block-demos'
      const samples = await Promise.all(Object.entries(blockDemos).map(async ([id, mount]) =>
        <section key={id} data-block={id}>{await mount()}</section>))
      createRoot(document.body.appendChild(document.createElement('div'))).render(<>
        {samples}
        <section data-case="address"><SwissAddressFields locale="it-CH" errors={{ postalCode: 'Lo sportello serve solo Lugano (6900).' }} /></section>
        <section data-case="notice"><Alert title="Opening hours">Monday to Friday</Alert></section>
      </>)
    `,
    resolveDir: fileURLToPath(root), loader: 'tsx',
  },
  bundle: true, format: 'esm', jsx: 'automatic', write: false, define: { 'process.env.NODE_ENV': '"production"' },
})

const browser = await launchVisualBrowser()
try {
  const page = await browser.newPage()
  await mountComponentGallery(page, undefined, { portalPage: false })
  await page.addScriptTag({ type: 'module', content: bundle.outputFiles[0].text })
  await page.locator('[data-case="address"] .al-field-error').waitFor()
  assert.deepEqual((await page.locator('[data-component]').evaluateAll(els => els.map(el => el.dataset.component))).sort(), items.map(item => item.name).sort())
  assert.deepEqual((await page.locator('[data-block]').evaluateAll(els => els.map(el => el.dataset.block))).sort(), blocks)
  assert.match(await page.locator('[data-case] .al-address-feedback').innerText(), /4 cifre/)
  assert.match(await page.locator('[data-case] .al-address-feedback').innerText(), /Lugano/)
  await page.evaluate(() => document.fonts.ready)
  const findLeaks = selector => {
    const firstFamily = value => value.split(',')[0].trim().replace(/^["']|["']$/g, '')
    const font = element => firstFamily(getComputedStyle(element).fontFamily)
    if (font(document.body) === 'Inter Variable') throw Error('The consumer test requires an unstyled body')
    if (!document.fonts.check('14px "Inter Variable"')) throw Error('The consumer stylesheet must load Inter')
    const failures = new Set()
    for (const sample of document.querySelectorAll(selector)) {
      const name = sample.dataset.component ?? sample.dataset.block ?? sample.dataset.case
      for (const el of sample.querySelectorAll('*')) {
        if (!el.checkVisibility({ checkVisibilityCSS: true, checkOpacity: true })) continue
        const text = [...el.childNodes].filter(node => node.nodeType === Node.TEXT_NODE).map(node => node.textContent).join('').trim()
        const control = el instanceof HTMLTextAreaElement || (el instanceof HTMLInputElement && ['text', 'email', 'tel', 'number', 'search', 'password', 'url', 'submit', 'button'].includes(el.type))
        if (!text && !(control && (el.value || el.placeholder))) continue
        const bounds = el.getBoundingClientRect()
        if (!bounds.width || !bounds.height || (bounds.width <= 1 && bounds.height <= 1)) continue
        const face = font(el)
        // The physical SIX payment slip deliberately uses the specified document face.
        if (face === 'Inter Variable' || face === 'ui-monospace' || (el.closest('.al-bill-slip') && face === 'Arial')) continue
        failures.add(name + ' / ' + el.tagName + '.' + el.getAttribute('class') + ' / ' + face + ' / ' + (text || el.placeholder || el.value).slice(0, 40))
      }
    }
    return [...failures]
  }
  const leaks = await page.evaluate(findLeaks, '[data-component],[data-block],[data-case]')
  for (const [name, [selector, key, surface]] of Object.entries(galleryOverlays)) {
    const sample = '[data-component="' + name + '"]'
    const trigger = page.locator(sample).locator(selector).first()
    if (key === 'focus') await trigger.focus()
    else await trigger.press(key)
    await page.locator(sample).locator(surface).first().waitFor()
    leaks.push(...await page.evaluate(findLeaks, sample))
    await page.keyboard.press('Escape')
    await trigger.blur()
  }
  assert.deepEqual(leaks, [], 'Visible consumer text must use an Alpina face')
  console.log('Verified library fonts on an unstyled body across ' + items.length + ' component previews, ' + blocks.length + ' blocks and standalone address feedback.')
} finally { await browser.close() }
